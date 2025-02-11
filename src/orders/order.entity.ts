import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { OrderStatus } from './enums/order-status.enum';
import { Feedback } from '../feedback/feedback.entity';
import { City } from '../locations/city.entity';
import { Area } from '../locations/area.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique order identifier', example: 1 })
  id: number;

  @ManyToOne(() => City, (city) => city.orders)
  @JoinColumn({ name: 'city_id' })
  @ApiProperty({ description: 'City associated with the order' })
  city: City;

  @ManyToOne(() => Area, (area) => area.orders)
  @JoinColumn({ name: 'area_id' })
  @ApiProperty({ description: 'Area associated with the order' })
  area: Area;

  @Column('jsonb')
  @IsNotEmpty()
  @ApiProperty({ description: 'List of products in the order' })
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    stock: number;
    lowStockAlert: boolean;
    size?: string;
  }[];

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Total order amount', example: 99.99 })
  total_amount: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Payment method used', example: 'online' })
  payment_method: string;

  @Column({ type: 'enum', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @ApiProperty({ description: 'Current order status', enum: OrderStatus })
  status: OrderStatus;

  @OneToMany(() => Feedback, (feedback) => feedback.order)
  @ApiProperty({
    description: 'Feedback associated with the order',
    type: () => [Feedback],
  })
  feedback: Feedback[];

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'User who placed the order' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the order was created' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Timestamp when the order was last updated' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Delivery time for the order', nullable: true })
  delivery_time: Date;

  // Soft deletion: if deletedAt is not null, the order is considered deleted.
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the order was soft-deleted',
    nullable: true,
  })
  deletedAt?: Date;
}
