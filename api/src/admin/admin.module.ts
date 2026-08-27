import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminCoursesService } from './admin-courses.service';
import { AdminCoursesController } from './admin-courses.controller';

@Module({
  controllers: [AdminController, AdminCoursesController],
  providers: [AdminService, AdminCoursesService],
  exports: [AdminService, AdminCoursesService],
})
export class AdminModule {}
