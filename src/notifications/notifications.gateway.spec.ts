// src/notifications/notifications.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationChannelsService } from './notification-channels.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: any;
  let userRepository: any;
  let notificationChannelsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                phone: '1234567890',
              }),
          },
        },
        {
          provide: NotificationChannelsService,
          useValue: {
            sendEmail: jest.fn(),
            sendSms: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    userRepository = module.get(getRepositoryToken(User));
    notificationChannelsService = module.get(NotificationChannelsService);
  });

  it('should create a notification', async () => {
    const result = await service.createNotification(
      { id: 1, email: 'test@example.com', phone: '1234567890' } as User,
      'Test message',
      'order_update',
    );
    expect(result).toBeDefined();
    expect(notificationRepository.create).toHaveBeenCalled();
    expect(notificationRepository.save).toHaveBeenCalled();
    expect(notificationChannelsService.sendEmail).toHaveBeenCalled();
    expect(notificationChannelsService.sendSms).toHaveBeenCalled();
  });
});
