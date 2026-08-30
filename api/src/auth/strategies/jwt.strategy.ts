import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../jwt.constants';

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
      secretOrKey: getJwtSecret(),
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
        googleAvatarUrl: true,
        avatarFrame: true,
        coins: true,
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

    const activeSub = await this.prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
    });

    const isPro = !!activeSub;

    return {
      ...user,
      isPro,
      deviceId: payload.deviceId,
    };
  }
}
