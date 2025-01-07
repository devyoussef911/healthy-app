// src/notifications/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  type: string; // e.g., 'order_update', 'low_stock_alert'

  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  smsSent: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
}
