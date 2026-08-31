import { IsNotEmpty, IsIn, IsString, MaxLength } from 'class-validator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;

  @IsIn(['ja-uz', 'uz-ja'])
  direction: 'ja-uz' | 'uz-ja';
}
