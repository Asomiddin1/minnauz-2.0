import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID Token yoki OAuth Access Token' })
  @IsString()
  @IsNotEmpty({ message: 'Google token kiritilishi shart' })
  token: string;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro', description: 'Qurilma nomi' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
