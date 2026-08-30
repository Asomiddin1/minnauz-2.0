import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from './dto/admin-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Admin Panel - JLPT Testlar (Tests CRUD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/tests')
export class AdminTestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha testlar roʻyxati (Admin)' })
  async getTests() {
    return this.testsService.adminFindAll();
  }

  @Post()
  @ApiOperation({ summary: 'Yangi JLPT test qoʻshish' })
  async createTest(@Body() dto: CreateTestDto) {
    return this.testsService.adminCreateTest(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta test va barcha savollari (Admin)' })
  async getTest(@Param('id') id: string) {
    return this.testsService.adminFindOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Test maʼlumotlarini tahrirlash' })
  async updateTest(@Param('id') id: string, @Body() dto: UpdateTestDto) {
    return this.testsService.adminUpdateTest(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Testni oʻchirish' })
  async deleteTest(@Param('id') id: string) {
    return this.testsService.adminDeleteTest(id);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Testga yangi savol qoʻshish' })
  async addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto) {
    return this.testsService.adminCreateQuestion(id, dto);
  }

  @Put('questions/:questionId')
  @ApiOperation({ summary: 'Savolni tahrirlash' })
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.testsService.adminUpdateQuestion(questionId, dto);
  }

  @Delete('questions/:questionId')
  @ApiOperation({ summary: 'Savolni oʻchirish' })
  async deleteQuestion(@Param('questionId') questionId: string) {
    return this.testsService.adminDeleteQuestion(questionId);
  }
}
