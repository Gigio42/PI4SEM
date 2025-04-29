import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  // Add cookie parser middleware
  app.use(cookieParser());
    // Configure CORS with comprehensive settings
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://192.168.0.74:3001'], // Added 127.0.0.1 variant
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 
                    'Cache-Control', 'cache-control', 'Pragma', 'pragma', 'Expires', 'expires'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  await app.listen(3000);
  logger.log(`Application listening on port 3000 with CORS enabled for frontend origins`);
}
bootstrap();
