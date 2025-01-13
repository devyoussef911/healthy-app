import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateCustomNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number; // ID of the user to notify

  @IsString()
  @IsNotEmpty()
  message: string; // Custom message

  @IsString()
  @IsNotEmpty()
  type: string; // Notification type (e.g., 'custom_notification')
}
