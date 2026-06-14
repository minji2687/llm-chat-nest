import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const originalLog = Logger.prototype.log;
Logger.prototype.log = function (message: any, context?: string) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    context: context || this.context,
    message,
  }));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
