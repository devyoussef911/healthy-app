import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAllLogs(@Req() req: any) {
    // Only admins can access all logs
    if (req.user.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied. Only admins can view all logs.',
      );
    }
    return this.auditLogService.getAllLogs();
  }

  @Get(':userId')
  async getLogsByUser(@Param('userId') userId: number, @Req() req: any) {
    // Allow users to view only their logs, unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      throw new ForbiddenException(
        'Access denied. You can only view your own logs.',
      );
    }

    const logs = await this.auditLogService.getLogsByUser(userId);

    if (!logs.length) {
      throw new NotFoundException(`No logs found for user ID ${userId}`);
    }

    return logs;
  }
}
