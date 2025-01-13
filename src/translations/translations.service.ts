import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './translation.entity';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>, // Inject the repository
  ) {}

  async createTranslation(key: string, values: Record<string, string>) {
    const translation = this.translationRepository.create({ key, values });
    return this.translationRepository.save(translation);
  }

  async getTranslation(key: string, lang: string) {
    const translation = await this.translationRepository.findOne({
      where: { key },
    });
    return translation?.values[lang] || key; // Fallback to the key if translation is not found
  }

  async updateTranslation(key: string, values: Record<string, string>) {
    const translation = await this.translationRepository.findOne({
      where: { key },
    });
    if (!translation) {
      throw new Error('Translation not found');
    }
    translation.values = { ...translation.values, ...values };
    return this.translationRepository.save(translation);
  }

  async deleteTranslation(key: string) {
    const result = await this.translationRepository.delete({ key });
    if (result.affected === 0) {
      throw new Error('Translation not found');
    }
  }
}
