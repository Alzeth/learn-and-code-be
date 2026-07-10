'use strict';

const express = require('express');

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
let swaggerDoc = null;

expressApp.get('/api-json', (_req, res) => {
  res.json(swaggerDoc);
});
expressApp.get('/api', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(swaggerUiHtml);
});

let nestReady = null;

function initNest() {
  nestReady ??= (async () => {
    const { NestFactory } = require('@nestjs/core');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const { ValidationPipe } = require('@nestjs/common');
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
    const { AppModule } = require('../dist/src/app.module');

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

module.exports = async (req, res) => {
  await initNest();
  expressApp(req, res);
};
