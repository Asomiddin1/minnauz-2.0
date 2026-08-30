import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CoursesModule } from './courses/courses.module';
import { UploadModule } from './upload/upload.module';
import { BannersModule } from './banners/banners.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TestsModule } from './tests/tests.module';
import { ShopModule } from './shop/shop.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SearchModule } from './search/search.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300,
      },
    ]),
    PrismaModule,
    AuthModule,
    AdminModule,
    CoursesModule,
    UploadModule,
    BannersModule,
    NotificationsModule,
    TestsModule,
    ShopModule,
    SubscriptionsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
