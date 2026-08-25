import 'reflect-metadata';
import { createApp } from './create-app';

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🔥 TaskForge backend running on http://localhost:${port}`);
  console.log(`📖 API docs: http://localhost:${port}/api/docs`);
}

bootstrap();
