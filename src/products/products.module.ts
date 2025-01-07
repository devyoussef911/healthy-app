import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { PricingModule } from '../pricing/pricing.module'; // Import PricingModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]), // Ensure entities are imported
    PricingModule, // Import PricingModule
  ],
  controllers: [ProductsController], // Ensure the controller is registered
  providers: [ProductsService], // Ensure the service is registered
})
export class ProductsModule {}
