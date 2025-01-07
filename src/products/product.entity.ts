import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { PricingRule } from '../pricing/pricing-rule.entity'; // Import PricingRule
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  IsBoolean,
} from 'class-validator';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  categoryId: number; // Ensure this is validated in the DTO

  @Column({ default: false })
  @IsBoolean()
  lowStockAlert: boolean; // Track if a low stock alert has been sent

  @OneToMany(() => PricingRule, (pricingRule) => pricingRule.product)
  pricingRules: PricingRule[]; // Add this line
}
