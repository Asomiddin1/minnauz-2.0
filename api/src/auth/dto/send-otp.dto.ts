import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'Foydalanuvchi email manzili' })
  @IsEmail({}, { message: "Noto'g'ri email formati" })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  email: string;
}
