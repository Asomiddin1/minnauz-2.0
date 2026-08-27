import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { Role } from './roles.enum';
import { randomUUID } from 'crypto';

const MAX_DEVICES = 3;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // 1. Send 6-digit OTP code to email
  async sendOtp(dto: SendOtpDto) {
    const email = dto.email.toLowerCase().trim();

    // Invalidate old unverified OTP codes for this email
    await this.prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send real email via SMTP if configured
    await this.mailService.sendOtpEmail(email, code);

    return {
      success: true,
      message: 'Tasdiqlash kodi emailga yuborildi',
      expiresInSeconds: 300,
      // For development testing ease, code can be inspected in terminal/logs
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  // 2. Verify OTP & Register/Login with Device Session
  async verifyOtp(dto: VerifyOtpDto, req: Request) {
    const email = dto.email.toLowerCase().trim();
    const code = dto.code.trim();

    // Check OTP validity
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new BadRequestException("Noto'g'ri yoki eskirgan tasdiqlash kodi");
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Find or create User
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // First user registered can optionally be made SUPER_ADMIN if needed, otherwise default USER
      const count = await this.prisma.user.count();
      const role = count === 0 ? Role.SUPER_ADMIN : Role.USER;

      user = await this.prisma.user.create({
        data: {
          email,
          role,
          isVerified: true,
        },
      });
    } else if (!user.isVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return this.createDeviceSession(user, dto.deviceName, req);
  }

  // 3. Google OAuth Login
  async googleAuth(dto: GoogleAuthDto, req: Request) {
    let email: string | undefined;
    let fullName: string | undefined;
    let avatarUrl: string | undefined;

    try {
      if (dto.token === 'google-mock-token' || dto.token.startsWith('dev-')) {
        // Fallback for dev testing
        email = 'google.user@example.com';
        fullName = 'Google Test User';
        avatarUrl = undefined;
      } else {
        // 1. Try Google ID Token verification
        if (process.env.GOOGLE_CLIENT_ID) {
          try {
            const ticket = await this.googleClient.verifyIdToken({
              idToken: dto.token,
              audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload?.email) {
              email = payload.email.toLowerCase();
              fullName = payload.name;
              avatarUrl = payload.picture;
            }
          } catch (idErr: any) {
            this.logger.warn(`ID Token xatosi (${idErr.message}), UserInfo API orqali tekshirilmoqda...`);
          }
        }

        // 2. Try Google UserInfo API (supports access_token)
        if (!email) {
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${dto.token}` },
            });
            if (res.ok) {
              const userInfo = await res.json();
              if (userInfo?.email) {
                email = userInfo.email.toLowerCase();
                fullName = userInfo.name;
                avatarUrl = userInfo.picture;
              }
            }
          } catch (fetchErr: any) {
            this.logger.warn(`UserInfo fetch xatosi: ${fetchErr.message}`);
          }
        }

        // 3. Try TokenInfo endpoint
        if (!email) {
          try {
            const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.token}`);
            if (res.ok) {
              const tokenInfo = await res.json();
              if (tokenInfo?.email) {
                email = tokenInfo.email.toLowerCase();
                fullName = tokenInfo.name;
                avatarUrl = tokenInfo.picture;
              }
            }
          } catch {}
        }

        if (!email) {
          throw new UnauthorizedException("Google ma'lumotlari yaroqsiz yoki eskirgan");
        }
      }
    } catch (err: any) {
      this.logger.error(`Google autentifikatsiyasida xatolik: ${err.message}`);
      throw new UnauthorizedException("Google orqali autentifikatsiya muvaffaqiyatsiz bo'ldi");
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const count = await this.prisma.user.count();
      const role = count === 0 ? Role.SUPER_ADMIN : Role.USER;

      user = await this.prisma.user.create({
        data: {
          email,
          fullName,
          avatarUrl,
          role,
          isVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName || user.fullName,
          avatarUrl: avatarUrl || user.avatarUrl,
          isVerified: true,
        },
      });
    }

    return this.createDeviceSession(user, dto.deviceName, req);
  }

  // 4. Device Manager: Create / Enforce Max 3 Active Devices
  private async createDeviceSession(user: any, customDeviceName: string | undefined, req: Request) {
    const uaHeader = req.headers['user-agent'] || '';
    const parser = new UAParser(uaHeader);
    const uaResult = parser.getResult();

    const os = uaResult.os.name ? `${uaResult.os.name} ${uaResult.os.version || ''}`.trim() : 'Nomaʼlum OS';
    const browser = uaResult.browser.name ? `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim() : 'Nomaʼlum Brauzer';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    
    const deviceName = customDeviceName || `${browser} on ${os}`;
    const deviceId = randomUUID();

    // Check active sessions count for user
    const existingSessions = await this.prisma.deviceSession.findMany({
      where: { userId: user.id },
      orderBy: { lastActiveAt: 'asc' },
    });

    // If max device limit reached (>= 3), remove oldest session(s)
    if (existingSessions.length >= MAX_DEVICES) {
      const sessionIdsToRemove = existingSessions
        .slice(0, existingSessions.length - MAX_DEVICES + 1)
        .map((s) => s.id);
      await this.prisma.deviceSession.deleteMany({
        where: { id: { in: sessionIdsToRemove } },
      });
    }

    // Generate Tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1d') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save new device session
    const session = await this.prisma.deviceSession.create({
      data: {
        userId: user.id,
        deviceId,
        deviceName,
        os,
        browser,
        ipAddress,
        refreshToken: hashedRefreshToken,
        lastActiveAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      device: {
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        os: session.os,
        browser: session.browser,
        ipAddress: session.ipAddress,
        lastActiveAt: session.lastActiveAt,
      },
    };
  }

  // 5. Get User's Active Devices List (Device Manager)
  async getUserDevices(userId: string, currentDeviceId?: string) {
    const sessions = await this.prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        os: true,
        browser: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.deviceId === currentDeviceId,
    }));
  }

  // 6. Revoke a specific device session
  async revokeDevice(userId: string, deviceId: string) {
    const session = await this.prisma.deviceSession.findFirst({
      where: { userId, deviceId },
    });

    if (!session) {
      throw new NotFoundException('Qurilma sessiyasi topilmadi');
    }

    await this.prisma.deviceSession.delete({
      where: { id: session.id },
    });

    return {
      success: true,
      message: 'Qurilma sessiyasi bekor qilindi',
    };
  }

  // 7. Logout (Delete current device session)
  async logout(userId: string, deviceId?: string) {
    if (deviceId) {
      await this.prisma.deviceSession.deleteMany({
        where: { userId, deviceId },
      });
    }
    return {
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqildi',
    };
  }
}
