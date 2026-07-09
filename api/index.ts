import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

import { AppModule } from '../src/app.module';

const expressApp = express();
let nestReady: Promise<void> | null = null;

function initNest(): Promise<void> {
  nestReady ??= (async () => {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn'],
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Learn and Code')
      .setDescription('Learn and Code API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.init();
  })();
  return nestReady;
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
  await initNest();
  expressApp(req, res);
}
