// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { InventoryModule } from '../inventory/inventory.module'; // Import InventoryModule
import { City } from 'src/locations/city.entity';
import { Area } from 'src/locations/area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Product, City, Area]), // Ensure entities are imported
    NotificationsModule,
    InventoryModule, // Import InventoryModule
  ],
  controllers: [OrdersController], // Ensure the controller is registered
  providers: [OrdersService], // Ensure the service is registered
})
export class OrdersModule {}
