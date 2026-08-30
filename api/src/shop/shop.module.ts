import { Module } from '@nestjs/common';
import { ShopController, CoinsController } from './shop.controller';
import { AdminShopController } from './admin-shop.controller';
import { ShopService } from './shop.service';
import { ShopSeedService } from './shop-seed.service';

@Module({
  controllers: [ShopController, CoinsController, AdminShopController],
  providers: [ShopService, ShopSeedService],
  exports: [ShopService],
})
export class ShopModule {}
