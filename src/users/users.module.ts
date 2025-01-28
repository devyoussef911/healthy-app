import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AuditLog } from '../audit-log/AuditLog.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditLog]),
    CacheModule.register({
      ttl: 300, // Cache expiration in seconds
      max: 100, // Maximum number of cache items
    }),
  ],
  providers: [UsersService, AuditLogService], // Include AuditLogService
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
