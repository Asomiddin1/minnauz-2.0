import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiPropertyOptional({ description: 'Tugatilgan boʻlimlar roʻyxati', example: ['kotoba', 'bunpou', 'kanji'] })
  @IsOptional()
  @IsArray()
  completedSections?: string[];

  @ApiPropertyOptional({ description: 'Renshuu test bali (0-100)', example: 100 })
  @IsOptional()
  @IsNumber()
  quizScore?: number;

  @ApiPropertyOptional({ description: 'Dars toʻliq tugatilganmi', example: true })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'Kurs nomi', example: 'Minna no Nihongo I (N5)' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Kurs slugi', example: 'minna-no-nihongo-1' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Kurs tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Kurs darajasi', example: 'N5' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Muqova rasmi URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Kurs muallifi (Oʻqituvchi ID)' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Nashr qilinganmi', example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateModuleDto {
  @ApiProperty({ description: 'Modul nomi', example: '1-5 darslar: Tanishtiruv va asoslar' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Modul tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateLessonDto {
  @ApiProperty({ description: 'Dars nomi', example: '1-dars: Oʻzini tanishtirish' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Yaponcha sarlavha', example: '第1課' })
  @IsOptional()
  @IsString()
  japaneseTitle?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'lesson-1' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Video havola (YouTube va h.k.)' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Dars qisqacha mazmuni' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'AI suhbat ssenariysi (JSON)' })
  @IsOptional()
  kaiwaScenario?: any;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class LogStudyTimeDto {
  @ApiPropertyOptional({ description: 'Oʻrganish vaqti (daqiqalarda)', example: 5 })
  @IsOptional()
  @IsNumber()
  minutes?: number;
}

export class SaveStudyPlanDto {
  @ApiPropertyOptional({ description: 'Maqsad darajasi', example: 'N5' })
  @IsOptional()
  @IsString()
  targetLevel?: string;

  @ApiPropertyOptional({ description: 'Haftalik maqsad soatlarda', example: 5 })
  @IsOptional()
  @IsNumber()
  weeklyGoalHours?: number;

  @ApiPropertyOptional({ description: 'Kunlik maqsad daqiqalarda', example: 30 })
  @IsOptional()
  @IsNumber()
  dailyMinutes?: number;

  @ApiPropertyOptional({ description: 'Maqsad muddati (oylarda)', example: 3 })
  @IsOptional()
  @IsNumber()
  targetMonths?: number;
}

