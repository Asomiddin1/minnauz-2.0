import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TeacherCoursesController } from './teacher-courses.controller';
import { TeacherTestsController } from './teacher-tests.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    TeacherController,
    TeacherCoursesController,
    TeacherTestsController,
  ],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
