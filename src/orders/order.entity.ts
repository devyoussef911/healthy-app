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

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City, (city) => city.orders)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => Area, (area) => area.orders)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @Column('jsonb')
  @IsNotEmpty()
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
  total_amount: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @Column({ type: 'enum', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @OneToMany(() => Feedback, (feedback) => feedback.order)
  feedback: Feedback[];

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivery_time: Date;
}
