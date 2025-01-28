// import { NestFactory, Reflector } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { RolesGuard } from './common/guards/roles.guard';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import express from 'express';
// import { ExpressAdapter } from '@nestjs/platform-express';

// // Create an Express app
// const expressApp = express();

// // Bootstrap the NestJS app
// async function bootstrap() {
//   const app = await NestFactory.create(
//     AppModule,
//     new ExpressAdapter(expressApp),
//   );

//   // Security Middleware
//   app.use(helmet()); // Add security headers
//   app.enableCors(); // Enable CORS (configure as needed)

//   // Rate Limiting
//   app.use(
//     rateLimit({
//       windowMs: 15 * 60 * 1000, // 15 minutes
//       max: 100, // Limit each IP to 100 requests per windowMs
//     }),
//   );

//   // Global Validation
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true, // Strip non-whitelisted properties
//       forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties
//       transform: true, // Automatically transform payloads to DTO instances
//     }),
//   );

//   // Global Guards
//   const reflector = new Reflector();
//   app.useGlobalGuards(new RolesGuard(reflector)); // Register RolesGuard globally

//   // Swagger Documentation
//   const config = new DocumentBuilder()
//     .setTitle('Healthy Milk Products API')
//     .setDescription('API for managing milk product orders')
//     .setVersion('1.0')
//     .addBearerAuth() // Add JWT authentication support
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document); // Serve Swagger at /api

//   // Initialize the app and start listening
//   await app.listen(3000); // Use listen to start the server
//   console.log('NestJS app is listening on http://localhost:3000');

//   // Initialize the app
//   await app.init();

//   // Return the Express app
//   return expressApp;
// }

// // Bootstrap the app and export the handler for Vercel
// let cachedApp: express.Express;

// export default async function handler(
//   req: express.Request,
//   res: express.Response,
// ) {
//   console.log('Request:', JSON.stringify(req.headers, null, 2)); // Log request headers
//   console.log('Response:', JSON.stringify(res.getHeaders(), null, 2)); // Log response headers

//   if (!cachedApp) {
//     cachedApp = await bootstrap();
//   }
//   return cachedApp(req, res);
// }

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

// Create an Express app
const expressApp = express();

// Bootstrap the NestJS app
async function bootstrap() {
  console.log('Bootstrapping the app...'); // Add this log
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Security Middleware
  app.use(helmet());
  app.enableCors();

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    }),
  );

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Guards
  const reflector = new Reflector();
  app.useGlobalGuards(new RolesGuard(reflector));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Healthy Milk Products API')
    .setDescription('API for managing milk product orders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initialize the app and start listening
  await app.listen(3000); // Ensure this line is there
  console.log('NestJS app is listening on http://localhost:3000'); // Log when the app starts

  // Initialize the app
  await app.init();

  // Return the Express app
  return expressApp;
}

// Call the bootstrap function directly for local dev
bootstrap().catch((err) => {
  console.error('Error bootstrapping app:', err);
});
