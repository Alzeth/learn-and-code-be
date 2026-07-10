import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

import { AppModule } from '../src/app.module';

const CDN = 'https://unpkg.com/swagger-ui-dist@5.32.8';

const swaggerUiHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Learn and Code - API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="${CDN}/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${CDN}/swagger-ui-bundle.js"></script>
    <script src="${CDN}/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: '/api-json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
          persistAuthorization: true,
        });
      };
    </script>
  </body>
</html>`;

const expressApp = express();
let swaggerDoc: Record<string, unknown> | null = null;

expressApp.get('/api-json', (_req: express.Request, res: express.Response) => {
  res.json(swaggerDoc);
});
expressApp.get('/api', (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(swaggerUiHtml);
});

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

    swaggerDoc = SwaggerModule.createDocument(app, config);

    await app.init();
  })();
  return nestReady;
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
  await initNest();
  expressApp(req, res);
}
