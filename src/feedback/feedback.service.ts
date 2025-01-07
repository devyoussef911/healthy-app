import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const { orderId, userId, rating, comment } = createFeedbackDto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const feedback = this.feedbackRepository.create({
      rating,
      comment,
      order,
      user,
    });

    return this.feedbackRepository.save(feedback);
  }

  async findByOrder(orderId: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { order: { id: orderId } },
      relations: ['user'],
    });
  }
}
