import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './AuditLog.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User])], // Include User entity
  providers: [AuditLogService],
  controllers: [AuditLogController],
  exports: [AuditLogService], // Export the service
})
export class AuditLogModule {}
