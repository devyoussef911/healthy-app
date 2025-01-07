// src/notifications/notifications.gateway.ts (updated)
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { User } from '../users/user.entity';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<number, Socket> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {}

  // Handle new connections
  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.userSockets.set(Number(userId), client);
      this.logger.log(`User ${userId} connected`);
    }
  }

  // Handle disconnections
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = Array.from(this.userSockets.entries()).find(
      ([_, socket]) => socket.id === client.id,
    )?.[0];
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  // Notify a specific user
  async notifyUser(userId: number, message: string, type: string) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('notification', message);
      this.logger.log(`Notification sent to user ${userId}: ${message}`);

      // Store the notification in the database
      const user = { id: userId } as User; // Simplified user object
      await this.notificationsService.createNotification(user, message, type);
    } else {
      this.logger.warn(`User ${userId} is not connected`);
    }
  }

  // Notify all admins
  async notifyAdmins(message: string, type: string) {
    this.server.emit('adminNotification', message);
    this.logger.log(`Admin notification sent: ${message}`);

    // Store the notification in the database for all admins
    // (You can fetch all admin users and store notifications for each)
  }

  // Handle order updates
  @SubscribeMessage('orderUpdate')
  handleOrderUpdate(
    @MessageBody() data: { orderId: number; status: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Notify the user about the order update
    this.notifyUser(
      data.userId,
      `Order ${data.orderId} status: ${data.status}`,
      'order_update',
    );

    // Notify admins about the order update
    this.notifyAdmins(
      `Order ${data.orderId} status: ${data.status}`,
      'order_update',
    );
  }
}
