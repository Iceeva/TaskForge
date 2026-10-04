import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { assertEnv } from './config/env';

export interface CreateAppOptions {
  /** true quand l'app tourne dans une fonction serverless (Vercel). */
  serverless?: boolean;
}

/**
 * Factory Nest partagée par le serveur local (src/main.ts) et par les
 * entrypoints serverless Vercel (api/index.js).
 */
export async function createApp(options: CreateAppOptions = {}): Promise<NestExpressApplication> {
  assertEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Derrière le proxy Vercel : nécessaire pour avoir la vraie IP / le bon protocole.
  app.set('trust proxy', 1);

  const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Requêtes non-navigateur (curl, health checks, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, false); // refus propre (pas de 500)
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('TaskForge API')
    .setDescription('SaaS Task Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);

  // En serverless, les assets de swagger-ui-dist ne sont pas embarqués dans la
  // fonction : on les charge depuis un CDN, sinon /api/docs affiche une page blanche.
  const cdn = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
  SwaggerModule.setup('api/docs', app, doc, {
    ...(options.serverless
      ? {
          customCssUrl: `${cdn}/swagger-ui.css`,
          customJs: [`${cdn}/swagger-ui-bundle.js`, `${cdn}/swagger-ui-standalone-preset.js`],
        }
      : {}),
  });

  return app;
}
