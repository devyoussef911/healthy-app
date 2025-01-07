import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class InventoryService {
  private readonly LOW_STOCK_THRESHOLD = 10; // Define low stock threshold

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async updateInventory(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['products'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    for (const product of order.products) {
      const dbProduct = await this.productRepository.findOne({
        where: { id: product.id },
      });

      if (!dbProduct) {
        throw new NotFoundException(`Product with ID ${product.id} not found`);
      }

      // Update stock for the main product
      const updatedStock = dbProduct.stock - product.quantity;
      if (updatedStock < 0) {
        throw new Error(`Insufficient stock for product: ${dbProduct.name}`);
      }

      await this.productRepository.update(dbProduct.id, {
        stock: updatedStock,
      });

      // Update stock for variations (if any)
      if (dbProduct.variations) {
        for (const variation of dbProduct.variations) {
          if (variation.size === product.size) {
            variation.stock -= product.quantity;
            if (variation.stock < 0) {
              throw new Error(
                `Insufficient stock for variation: ${variation.size}`,
              );
            }
          }
        }

        await this.productRepository.update(dbProduct.id, {
          variations: dbProduct.variations,
        });
      }

      // Check for low stock and send alert if necessary
      if (
        updatedStock <= this.LOW_STOCK_THRESHOLD &&
        !dbProduct.lowStockAlert
      ) {
        await this.sendLowStockAlert(dbProduct);
        await this.productRepository.update(dbProduct.id, {
          lowStockAlert: true,
        });
      }
    }
  }

  private async sendLowStockAlert(product: Product): Promise<void> {
    // Implement logic to send low stock alert (e.g., email, SMS, etc.)
    console.log(`Low stock alert for product: ${product.name}`);
  }
}
