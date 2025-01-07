// src/feedback/feedback.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Feedback } from './feedback.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepository: any;
  let orderRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    feedbackRepository = module.get(getRepositoryToken(Feedback));
    orderRepository = module.get(getRepositoryToken(Order));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should create feedback', async () => {
    const createFeedbackDto = {
      orderId: 1,
      userId: 1,
      rating: 5,
      comment: 'Great service!',
    };

    const result = await service.create(createFeedbackDto);
    expect(result).toBeDefined();
    expect(feedbackRepository.create).toHaveBeenCalled();
    expect(feedbackRepository.save).toHaveBeenCalled();
  });

  it('should find feedback by order', async () => {
    const result = await service.findByOrder(1);
    expect(result).toBeDefined();
    expect(feedbackRepository.find).toHaveBeenCalled();
  });
});
