import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';
import { Translation } from './translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Translation])], // Register the Translation entity
  controllers: [TranslationsController],
  providers: [TranslationsService],
  exports: [TranslationsService], // Export the TranslationsService
})
export class TranslationsModule {}
