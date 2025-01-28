import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './translation.entity';

@Injectable()
export class TranslationSeeder {
  constructor(
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
  ) {}

  async seed() {
    const translations = [
      {
        key: 'product.name',
        values: { en: 'Product Name', ar: 'اسم المنتج' },
      },
      {
        key: 'product.description',
        values: { en: 'Product Description', ar: 'وصف المنتج' },
      },
      {
        key: 'order.status.pending',
        values: { en: 'Pending', ar: 'قيد الانتظار' },
      },
      {
        key: 'order.status.delivered',
        values: { en: 'Delivered', ar: 'تم التوصيل' },
      },
    ];

    for (const translation of translations) {
      const existing = await this.translationRepository.findOne({
        where: { key: translation.key },
      });
      if (!existing) {
        await this.translationRepository.save(translation);
      }
    }

    console.log('Translations seeded successfully.');
  }
}
