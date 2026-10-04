// Vercel serverless entrypoint (déploiement mono-projet depuis la racine du repo).
// Le backend NestJS est compilé dans backend/dist par `npm run vercel-build`.
require('reflect-metadata');
const serverlessExpress = require('@vendia/serverless-express');
const { createApp } = require('../backend/dist/create-app');

let cachedHandler;

async function bootstrap() {
  const app = await createApp({ serverless: true });
  await app.init();
  return serverlessExpress({ app: app.getHttpAdapter().getInstance() });
}

module.exports = async (req, res) => {
  if (!cachedHandler) cachedHandler = await bootstrap();
  return cachedHandler(req, res);
};
