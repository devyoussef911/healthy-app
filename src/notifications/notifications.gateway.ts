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

  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.userSockets.set(Number(userId), client);
      this.logger.log(`User ${userId} connected`);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = Array.from(this.userSockets.entries()).find(
      ([, socket]) => socket.id === client.id,
    )?.[0];
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  async notifyUser(userId: number, message: string, type: string) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('notification', { message, type });
      this.logger.log(`Notification sent to user ${userId}: ${message}`);
      // Optionally record the notification in the database.
      const user = { id: userId } as User;
      await this.notificationsService.createNotification(user, message, type);
    } else {
      this.logger.warn(`User ${userId} is not connected`);
    }
  }

  async notifyAdmins(message: string, type: string) {
    this.server.emit('adminNotification', { message, type });
    this.logger.log(`Admin notification sent: ${message}`);
    // Fetch all admin users and store notifications for each.
    const admins = await this.notificationsService.getAdmins();
    for (const admin of admins) {
      await this.notificationsService.createNotification(admin, message, type);
    }
  }

  @SubscribeMessage('orderUpdate')
  handleOrderUpdate(
    @MessageBody() data: { orderId: number; status: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.notifyUser(
      data.userId,
      `Order ${data.orderId} status: ${data.status}`,
      'order_update',
    );
    this.notifyAdmins(
      `Order ${data.orderId} status: ${data.status}`,
      'order_update',
    );
  }
}
