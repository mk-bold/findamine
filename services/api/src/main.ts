// Entrypoint: creates the Nest app, enables CORS, exposes Swagger.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parsing
  app.use(cookieParser());
  
  // Configure CORS to work with credentials
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Next.js web app (original port)
      'http://localhost:3001',  // Next.js web app (current port)
      'http://localhost:19006', // Expo web app
      'http://localhost:8081',  // Expo dev server
      'http://localhost:19000', // Expo Go
      'http://localhost:19001', // Expo Go
      'http://localhost:19002', // Expo Go
    ],
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Cookie-Consent'],
  });

  const cfg = new DocumentBuilder().setTitle('Findamine API').setVersion('0.1.0').build();
  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(4000);
  console.log('API http://localhost:4000  docs: /docs');
}
bootstrap();