// src/feedback/feedback.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.USER) // Only users can submit feedback
  async create(@Body() createFeedbackDto: CreateFeedbackDto) {
    try {
      return await this.feedbackService.create(createFeedbackDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to submit feedback',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':orderId')
  @Roles(UserRole.ADMIN) // Only admins can view feedback
  async findByOrder(@Param('orderId') orderId: number) {
    try {
      return await this.feedbackService.findByOrder(orderId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to fetch feedback',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
