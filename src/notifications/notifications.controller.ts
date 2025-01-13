import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateCustomNotificationDto } from './dto/create-custom-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('custom')
  @Roles(UserRole.CONTROLLER)
  async createCustomNotification(
    @Body() createCustomNotificationDto: CreateCustomNotificationDto,
  ) {
    try {
      const { userId, message, type } = createCustomNotificationDto;

      const user = await this.notificationsService.getUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const notification = await this.notificationsService.createNotification(
        user,
        message,
        type,
      );

      return {
        status: 'success',
        message: 'Custom notification sent successfully',
        data: notification,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send custom notification',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
