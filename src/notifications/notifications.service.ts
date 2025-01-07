// src/notifications/notifications.service.ts (updated)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationChannelsService } from './notification-channels.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationChannelsService: NotificationChannelsService,
  ) {}

  async createNotification(
    user: User,
    message: string,
    type: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user,
      message,
      type,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Send email notification
    await this.notificationChannelsService.sendEmail(
      user.email,
      'Order Update',
      message,
    );
    savedNotification.emailSent = true;

    // Send SMS notification
    await this.notificationChannelsService.sendSms(user.mobileNumber, message); // Use mobileNumber
    savedNotification.smsSent = true;

    // Update the notification with delivery status
    return this.notificationRepository.save(savedNotification);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
