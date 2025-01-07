// src/orders/order.entity.ts (updated)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { OrderStatus } from './enums/order-status.enum';
import { Feedback } from '../feedback/feedback.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  city: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  area: string;

  @Column('jsonb')
  @IsNotEmpty()
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    stock: number; // Add stock
    lowStockAlert: boolean; // Add lowStockAlert
  }[];

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  payment_method: string; // e.g., 'online' or 'cod'

  @Column({ nullable: true })
  @IsString()
  delivery_time: string; // Optional for "later" orders

  @Column({ default: OrderStatus.PENDING })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus; // Use the OrderStatus enum

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Feedback, (feedback) => feedback.order)
  feedbacks: Feedback[];
}
