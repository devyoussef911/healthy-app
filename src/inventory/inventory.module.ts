// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order])], // Import Product and Order entities
  providers: [InventoryService],
  exports: [InventoryService], // Export InventoryService
})
export class InventoryModule {}
