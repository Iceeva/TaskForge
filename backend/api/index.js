// Vercel serverless entrypoint (projet "backend" seul, Root Directory = backend).
// Utilise le build compilé (dist/) produit par `npm run vercel-build` : on évite
// ainsi la recompilation TypeScript par Vercel, qui gère mal les décorateurs NestJS.
require('reflect-metadata');
const serverlessExpress = require('@vendia/serverless-express');
const { createApp } = require('../dist/create-app');

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
