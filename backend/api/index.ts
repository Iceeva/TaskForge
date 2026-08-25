import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from '../src/create-app';

// Cached across warm invocations so we don't re-bootstrap Nest (and
// re-connect Prisma) on every request.
let cachedHandler: any;

async function bootstrapServer() {
  const app = await createApp();
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }
  return cachedHandler(req, res);
}
