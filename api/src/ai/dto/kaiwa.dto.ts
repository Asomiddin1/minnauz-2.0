import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class KaiwaHistoryItemDto {
  @IsString()
  sender: 'ai' | 'user';

  @IsString()
  japanese: string;

  @IsOptional()
  @IsString()
  romaji?: string;

  @IsOptional()
  @IsString()
  uzbek?: string;
}

export class KaiwaMessageDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsOptional()
  @IsString()
  lessonTitle?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  partnerName?: string;

  @IsOptional()
  @IsArray()
  kotobaWords?: string[];

  @IsArray()
  history: KaiwaHistoryItemDto[];

  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsInt()
  @Min(1)
  @Max(6)
  step: number;
}
