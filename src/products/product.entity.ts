import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { PricingRule } from '../pricing/pricing-rule.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  IsBoolean,
  IsArray,
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
  categoryId: number;

  @Column({ default: false })
  @IsBoolean()
  lowStockAlert: boolean;

  @OneToMany(() => PricingRule, (pricingRule) => pricingRule.product)
  pricingRules: PricingRule[];

  @Column('jsonb', { nullable: true })
  @IsArray()
  variations: Array<{
    size: string;
    price: number;
    stock: number;
  }>; // Add this property
}
