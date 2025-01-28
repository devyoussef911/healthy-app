import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './AuditLog.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,

    @InjectRepository(User) // Inject UserRepository
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({ relations: ['user'] });
  }

  async getLogsByUser(userId: number): Promise<AuditLog[]> {
    const logs = await this.auditLogRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!logs.length) {
      throw new NotFoundException(`No logs found for user ID ${userId}`);
    }

    return logs;
  }

  async logAction(
    userId: number,
    action: string,
    details?: any,
  ): Promise<void> {
    // Fetch the user by ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Create and save the audit log entry
    const log = this.auditLogRepository.create({
      user,
      action,
      details: details || { performedBy: userId },
    });

    await this.auditLogRepository.save(log);
  }
}
