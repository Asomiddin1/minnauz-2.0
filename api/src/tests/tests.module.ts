import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { AdminTestsController } from './admin-tests.controller';
import { TestsService } from './tests.service';
import { TestsSeedService } from './tests-seed.service';

@Module({
  controllers: [TestsController, AdminTestsController],
  providers: [TestsService, TestsSeedService],
  exports: [TestsService],
})
export class TestsModule {}
