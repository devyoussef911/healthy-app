import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the audit log entry' })
  id: number;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @ApiProperty({ description: 'User who performed the action', nullable: true })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Action performed', example: 'CREATE_CATEGORY' })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({
    description: 'Details about the action',
    example: { categoryId: 1 },
  })
  details: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Timestamp when the action was performed' })
  createdAt: Date;
}
