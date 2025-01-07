import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { PricingRule } from './pricing-rule.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(PricingRule)
    private pricingRuleRepository: Repository<PricingRule>, // Inject PricingRuleRepository
  ) {}

  async calculateDynamicPrice(product: Product): Promise<number> {
    let price = product.price;

    // Fetch dynamic pricing rules for the product
    const pricingRules = await this.pricingRuleRepository.find({
      where: { product: { id: product.id } }, // Use the product relation
    });

    // Apply pricing rules
    for (const rule of pricingRules) {
      if (rule.condition === 'peak_hours' && this.isPeakHour()) {
        price *= rule.multiplier;
      } else if (
        rule.condition === 'low_stock' &&
        product.stock <= rule.threshold
      ) {
        price *= rule.multiplier;
      }
    }

    return parseFloat(price.toFixed(2)); // Round to 2 decimal places
  }

  private isPeakHour(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 12 && currentHour <= 18; // Example peak hours
  }
}
