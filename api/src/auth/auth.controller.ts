import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role } from './roles.enum';

@ApiTags('Autentifikatsiya & Qurilmalar (Auth & Devices)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emailga 6 xonali OTP kod joʻnatish' })
  @ApiResponse({
    status: 200,
    description: 'Tasdiqlash kodi muvaffaqiyatli yuborildi',
  })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OTP kodni tekshirish va tizimga kirish/roʻyxatdan oʻtish',
  })
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli kirildi va tokenlar qaytarildi',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.authService.verifyOtp(dto, req);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google orqali tizimga kirish/roʻyxatdan oʻtish' })
  @ApiResponse({
    status: 200,
    description: 'Google orqali muvaffaqiyatli kirildi',
  })
  async googleAuth(@Body() dto: GoogleAuthDto, @Req() req: Request) {
    return this.authService.googleAuth(dto, req);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access va refresh tokenlarni yangilash' })
  @ApiResponse({ status: 200, description: 'Yangi tokenlar qaytarildi' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi maʼlumotlari' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining faol qurilmalari roʻyxati (Maksimal 3 ta)',
  })
  async getDevices(@CurrentUser() user: any) {
    return this.authService.getUserDevices(user.id, user.deviceId);
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Boshqa qurilmadagi sessiyani bekor qilish' })
  async revokeDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.authService.revokeDevice(userId, deviceId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Joriy qurilmadan chiqish' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id, user.deviceId);
  }

  @Get('admin-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin huquqini tekshirish (Faqat Admin / SuperAdmin uchun)',
  })
  async checkAdminAccess(@CurrentUser() user: any) {
    return {
      hasAccess: true,
      role: user.role,
      message: 'Admin panelga kirish ruxsat etildi',
    };
  }
}
