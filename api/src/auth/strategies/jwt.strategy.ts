import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  deviceId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'minnauz-super-secret-jwt-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    // Check if device session was revoked by admin or logged out
    if (payload.deviceId) {
      const session = await this.prisma.deviceSession.findUnique({
        where: { deviceId: payload.deviceId },
        select: { id: true, userId: true },
      });

      if (!session || session.userId !== user.id) {
        throw new UnauthorizedException(
          'Sessiyangiz admin tomonidan bekor qilingan yoki tugatilgan. Iltimos qaytadan kiring.',
        );
      }
    }

    return {
      ...user,
      deviceId: payload.deviceId,
    };
  }
}
