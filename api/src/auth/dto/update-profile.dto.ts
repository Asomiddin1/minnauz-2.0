import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Asomiddin Qarshiyev',
    description: 'Foydalanuvchining toʻliq ismi va familiyasi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Ism uzunligi 80 ta belgidan oshmasligi kerak' })
  fullName?: string;
}
