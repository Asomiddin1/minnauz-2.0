import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class GenerateDokkaiDto {
  @IsString()
  @IsIn(['N5', 'N4', 'N3'])
  level: 'N5' | 'N4' | 'N3';

  @IsString()
  @IsNotEmpty()
  topic: string;
}
