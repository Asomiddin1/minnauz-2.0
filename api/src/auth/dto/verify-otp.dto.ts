import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'Foydalanuvchi email manzili' })
  @IsEmail({}, { message: "Noto'g'ri email formati" })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  email: string;

  @ApiProperty({ example: '123456', description: '6 xonali tasdiqlash kodi' })
  @IsString()
  @Length(6, 6, { message: "Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak" })
  @IsNotEmpty({ message: 'Kod kiritilishi shart' })
  code: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows', description: 'Qurilma nomi' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
