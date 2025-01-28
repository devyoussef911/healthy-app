// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
// } from 'typeorm';
// import {
//   IsEmail,
//   IsNotEmpty,
//   IsString,
//   MinLength,
//   MaxLength,
// } from 'class-validator';
// import { Order } from '../orders/order.entity';
// import { Feedback } from '../feedback/feedback.entity';
// import { Notification } from '../notifications/notification.entity';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   @IsEmail()
//   email: string;

//   @Column({ unique: true })
//   @IsNotEmpty()
//   @IsString()
//   @MinLength(10)
//   @MaxLength(10)
//   mobileNumber: string;

//   @Column()
//   @IsNotEmpty()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   firstName: string;

//   @Column()
//   @IsNotEmpty()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   lastName: string;

//   @Column()
//   @IsNotEmpty()
//   @IsString()
//   passwordHash: string;

//   @Column({ default: 'user' })
//   role: string;

//   @Column({ nullable: true })
//   profilePictureUrl: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @OneToMany(() => Order, (order) => order.user)
//   orders: Order[];

//   @OneToMany(() => Notification, (notification) => notification.user)
//   notifications: Notification[];

//   @OneToMany(() => Feedback, (feedback) => feedback.user)
//   feedbacks: Feedback[];
// }

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Notification } from '../notifications/notification.entity';
import { AuditLog } from '../audit-log/AuditLog.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  mobileNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ default: false })
  isDeleted: boolean; // Soft delete flag

  @CreateDateColumn()
  createdAt: Date;

  // Add the relationship with AuditLog
  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[]; // This property resolves the error

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];
}
