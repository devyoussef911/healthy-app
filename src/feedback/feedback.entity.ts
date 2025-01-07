// src/feedback/feedback.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // Rating from 1 to 5

  @Column({ type: 'text', nullable: true })
  comment: string; // Optional comment

  @ManyToOne(() => Order, (order) => order.feedbacks)
  order: Order;

  @ManyToOne(() => User, (user) => user.feedbacks)
  user: User;
}
