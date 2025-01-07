import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { InventoryModule } from './inventory/inventory.module';
import { I18nModule, I18nJsonLoader } from 'nestjs-i18n'; // Use I18nJsonLoader
import * as path from 'path';
import {
  HeaderResolver,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { LanguageMiddleware } from './middleware/language.middleware';
import { TranslationsModule } from './translations/translations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en', // Default language
      loader: I18nJsonLoader, // Use I18nJsonLoader instead of I18nJsonParser
      loaderOptions: {
        path: path.join(__dirname, '/../i18n/'), // Path to the i18n folder
      },
      resolvers: [
        // Resolve language from URL parameter (e.g., /ar/products/1)
        {
          use: QueryResolver,
          options: ['lang'], // Detects lang from query params
        },
        // Resolve language from headers (fallback)
        {
          use: HeaderResolver,
          options: ['x-lang'], // Detects lang from headers
        },
        // Resolve language from Accept-Language header (fallback)
        new AcceptLanguageResolver(),
      ],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    NotificationsModule,
    PricingModule,
    AnalyticsModule,
    FeedbackModule,
    InventoryModule,
    TranslationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Register RolesGuard globally
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*'); // Apply middleware to all routes
  }
}
