import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://greenteam.app',
      'http://greenteam.app',
      'https://admin.greenteam.app',
      'https://api.greenteam.app',
      'https://greentest-henna.vercel.app',
      'https://greenteam.yllaaa.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
        req.rawBodyString = buf.toString();
      },
    }),
  );
  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      dotfiles: 'allow',
    }),
  );
  await app.listen(process.env.PORT || 9000);
}
bootstrap();
