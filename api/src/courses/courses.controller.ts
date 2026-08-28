import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { CoursesService } from './courses.service';
import { UpdateProgressDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Kurslar va Darslar (Courses & Lessons)')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: any): string | undefined {
    try {
      if (req.user?.id) return req.user.id;
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = this.jwtService.decode(token) as any;
        return decoded?.sub || decoded?.id;
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  @Get('user/stats')
  @ApiOperation({ summary: 'Foydalanuvchining oʻrganish statistikasi (streak, oʻrganilgan soʻzlar, darslar)' })
  async getUserStats(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getUserStats(userId);
  }

  @Post('user/study-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchi platformada oʻtkazgan oʻrganish vaqtini saqlash' })
  async logStudyTime(
    @CurrentUser('id') userId: string,
    @Body() body: { minutes?: number },
  ) {
    return this.coursesService.logStudyTime(userId, body?.minutes || 1);
  }

  @Get('user/study-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchining shaxsiy oʻrganish rejasini olish' })
  async getStudyPlan(@CurrentUser('id') userId: string) {
    return this.coursesService.getUserStudyPlan(userId);
  }

  @Post('user/study-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchining shaxsiy oʻrganish rejasini saqlash yoki yangilash' })
  async saveStudyPlan(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      targetLevel?: string;
      weeklyGoalHours?: number;
      dailyMinutes?: number;
      targetMonths?: number;
    },
  ) {
    return this.coursesService.saveUserStudyPlan(userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kurslar roʻyxatini olish (oʻzlashtirish progressi bilan)' })
  async getCourses(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getCourses(userId);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Bitta kurs tafsilotlari, modullar va darslar xaritasi (Roadmap)' })
  async getCourseDetails(@Param('idOrSlug') idOrSlug: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getCourseDetails(idOrSlug, userId);
  }

  @Get(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Dars tafsilotlari va 5 ta boʻlim kontenti (Kotoba, Bunpou, Kanji, Renshuu, Kaiwa)' })
  async getLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req);
    return this.coursesService.getLesson(lessonId, userId);
  }

  @Post(':courseId/lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dars boʻlimi yoki test natijasi progressini saqlash' })
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.coursesService.updateProgress(userId, lessonId, dto);
  }
}
