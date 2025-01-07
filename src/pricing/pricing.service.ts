import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { PricingRule } from './pricing-rule.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingRule)
    private pricingRuleRepository: Repository<PricingRule>,
  ) {}

  async calculateDynamicPrice(product: Product): Promise<number> {
    let price = product.price;

    // Fetch dynamic pricing rules for the product
    const pricingRules = await this.pricingRuleRepository.find({
      where: { product: { id: product.id } },
    });

    // Apply pricing rules
    for (const rule of pricingRules) {
      if (rule.condition === 'peak_hours' && this.isPeakHour(rule)) {
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

  private isPeakHour(rule: PricingRule): boolean {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if the current time is within the rule's startTime and endTime
    if (rule.startTime && rule.endTime) {
      const startHour = new Date(rule.startTime).getHours();
      const endHour = new Date(rule.endTime).getHours();
      return currentHour >= startHour && currentHour <= endHour;
    }

    // Default peak hours (12 PM to 6 PM)
    return currentHour >= 12 && currentHour <= 18;
  }
}
