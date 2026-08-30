import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionsController,
  AdminSubscriptionsController,
} from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController, AdminSubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
