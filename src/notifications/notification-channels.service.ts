import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationChannelsService {
  private readonly logger = new Logger(NotificationChannelsService.name);
  private transporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio | null = null;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // Initialize Twilio client if credentials are provided
    const twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioAccountSid && twilioAuthToken) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      this.logger.log('Twilio client initialized.');
    } else {
      this.logger.warn(
        'Twilio credentials not found. SMS notifications are disabled.',
      );
    }
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio client is not initialized. SMS not sent.');
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
      this.logger.log(`SMS sent to ${to}: ${body}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
