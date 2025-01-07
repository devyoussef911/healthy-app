import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingRule } from './pricing-rule.entity'; // Import PricingRule entity
import { Product } from '../products/product.entity'; // Import Product entity

@Module({
  imports: [
    TypeOrmModule.forFeature([PricingRule, Product]), // Register PricingRule and Product entities
  ],
  providers: [PricingService],
  exports: [PricingService], // Export PricingService if it's used in other modules
})
export class PricingModule {}
