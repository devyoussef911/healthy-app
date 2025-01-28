// import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './common/guards/roles.guard';
// import { ProductsModule } from './products/products.module';
// import { CategoriesModule } from './categories/categories.module';
// import { OrdersModule } from './orders/orders.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { PricingModule } from './pricing/pricing.module';
// import { AnalyticsModule } from './analytics/analytics.module';
// import { FeedbackModule } from './feedback/feedback.module';
// import { InventoryModule } from './inventory/inventory.module';
// import { I18nModule, I18nJsonLoader } from 'nestjs-i18n'; // Use I18nJsonLoader
// import * as path from 'path';
// import {
//   HeaderResolver,
//   QueryResolver,
//   AcceptLanguageResolver,
// } from 'nestjs-i18n';
// import { LanguageMiddleware } from './middleware/language.middleware';
// import { TranslationsModule } from './translations/translations.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         host: configService.get('DB_HOST'),
//         port: +configService.get('DB_PORT'),
//         username: configService.get('DB_USERNAME'),
//         password: configService.get('DB_PASSWORD'),
//         database: configService.get('DB_NAME'),
//         entities: [__dirname + '/**/*.entity{.ts,.js}'],
//         synchronize: true, // Set to false in production
//       }),
//     }),
//     I18nModule.forRoot({
//       fallbackLanguage: 'en', // Default language
//       loader: I18nJsonLoader, // Use I18nJsonLoader instead of I18nJsonParser
//       loaderOptions: {
//         path: path.join(__dirname, '/../i18n/'), // Path to the i18n folder
//       },
//       resolvers: [
//         // Resolve language from URL parameter (e.g., /ar/products/1)
//         {
//           use: QueryResolver,
//           options: ['lang'], // Detects lang from query params
//         },
//         // Resolve language from headers (fallback)
//         {
//           use: HeaderResolver,
//           options: ['x-lang'], // Detects lang from headers
//         },
//         // Resolve language from Accept-Language header (fallback)
//         new AcceptLanguageResolver(),
//       ],
//     }),
//     UsersModule,
//     AuthModule,
//     ProductsModule,
//     CategoriesModule,
//     OrdersModule,
//     NotificationsModule,
//     PricingModule,
//     AnalyticsModule,
//     FeedbackModule,
//     InventoryModule,
//     TranslationsModule,
//   ],
//   providers: [
//     {
//       provide: APP_GUARD,
//       useClass: RolesGuard, // Register RolesGuard globally
//     },
//   ],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LanguageMiddleware).forRoutes('*'); // Apply middleware to all routes
//   }
// }

// import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import {
//   I18nModule,
//   I18nJsonLoader,
//   HeaderResolver,
//   QueryResolver,
//   AcceptLanguageResolver,
// } from 'nestjs-i18n';
// import * as path from 'path';
// import { LanguageMiddleware } from './middleware/language.middleware';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './common/guards/roles.guard';
// import { ProductsModule } from './products/products.module';
// import { CategoriesModule } from './categories/categories.module';
// import { OrdersModule } from './orders/orders.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { PricingModule } from './pricing/pricing.module';
// import { AnalyticsModule } from './analytics/analytics.module';
// import { FeedbackModule } from './feedback/feedback.module';
// import { InventoryModule } from './inventory/inventory.module';
// import { TranslationsModule } from './translations/translations.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         host: configService.get('DB_HOST'),
//         port: +configService.get('DB_PORT'),
//         username: configService.get('DB_USERNAME'),
//         password: configService.get('DB_PASSWORD'),
//         database: configService.get('DB_NAME'),
//         entities: [__dirname + '/**/*.entity{.ts,.js}'],
//         synchronize: true, // Set to false in production
//         ssl: {
//           rejectUnauthorized: false, // Required for some databases like Neon
//         },
//       }),
//     }),
//     I18nModule.forRoot({
//       fallbackLanguage: 'en', // Default language
//       loaderOptions: {
//         path: path.join(__dirname, '/../i18n/'), // Path to the i18n folder
//       },
//       resolvers: [
//         // Resolve language from URL parameter (e.g., /ar/products/1)
//         new QueryResolver(['lang']), // Detects lang from query params
//         // Resolve language from headers (fallback)
//         new HeaderResolver(['x-lang']), // Detects lang from headers
//         // Resolve language from Accept-Language header (fallback)
//         new AcceptLanguageResolver(),
//       ],
//     }),
//     UsersModule,
//     AuthModule,
//     ProductsModule,
//     CategoriesModule,
//     OrdersModule,
//     NotificationsModule,
//     PricingModule,
//     AnalyticsModule,
//     FeedbackModule,
//     InventoryModule,
//     TranslationsModule,
//   ],
//   providers: [
//     {
//       provide: APP_GUARD,
//       useClass: RolesGuard, // Register RolesGuard globally
//     },
//   ],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LanguageMiddleware).forRoutes('*'); // Apply middleware to all routes
//   }
// }

import {
  Module,
  MiddlewareConsumer,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  I18nModule,
  HeaderResolver,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { LanguageMiddleware } from './middleware/language.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { InventoryModule } from './inventory/inventory.module';
import { TranslationsModule } from './translations/translations.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
    }),
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
        synchronize: process.env.NODE_ENV !== 'production',
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    CacheModule.register({
      ttl: 300, // Default cache time-to-live (5 minutes)
      max: 100, // Maximum number of cached items
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/../i18n/'),
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-lang']),
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
    AuditLogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    // You can seed data or perform tasks upon module initialization
    console.log('App module initialized');
  }
}
