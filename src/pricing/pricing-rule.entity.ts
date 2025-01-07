import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class PricingRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  condition: string; // e.g., 'peak_hours', 'low_stock'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  multiplier: number; // e.g., 1.2 for 20% increase

  @Column({ nullable: true })
  threshold: number; // Only for 'low_stock' condition

  @ManyToOne(() => Product, (product) => product.pricingRules)
  product: Product;
}
