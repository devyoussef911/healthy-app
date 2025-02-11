import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './AuditLog.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    details?: Record<string, any>,
  ): Promise<void> {
    const log = this.auditLogRepository.create({ action, details });
    await this.auditLogRepository.save(log);
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({ relations: ['user'] });
  }

  async getLogsByUser(userId: number): Promise<AuditLog[]> {
    const logs = await this.auditLogRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!logs.length) {
      throw new Error(`No logs found for user ID ${userId}`);
    }
    return logs;
  }
}
