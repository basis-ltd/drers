import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigins = (process.env.FRONTEND_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin:
      frontendOrigins.length > 0 ? frontendOrigins : 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
