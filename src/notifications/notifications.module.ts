import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationChannelsService } from './notification-channels.service';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [
    NotificationsGateway,
    NotificationsService,
    NotificationChannelsService,
  ],
  exports: [NotificationsGateway, NotificationsService], // Export NotificationsGateway
})
export class NotificationsModule {}
