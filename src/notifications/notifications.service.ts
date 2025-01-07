import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationChannelsService } from './notification-channels.service';
import { UserRole } from '../users/enums/user-role.enum'; // Import UserRole

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name); // Initialize Logger

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

    try {
      await this.notificationChannelsService.sendEmail(
        user.email,
        'Custom Notification',
        message,
      );
      savedNotification.emailSent = true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${user.email}: ${error.message}`,
      );
    }

    try {
      await this.notificationChannelsService.sendSms(
        user.mobileNumber,
        message,
      );
      savedNotification.smsSent = true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${user.mobileNumber}: ${error.message}`,
      );
    }

    return this.notificationRepository.save(savedNotification);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getAdmins(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.ADMIN } });
  }
}
