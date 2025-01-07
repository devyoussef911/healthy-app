import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('update')
  async updateInventory(@Body('orderId') orderId: number): Promise<void> {
    try {
      await this.inventoryService.updateInventory(orderId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
