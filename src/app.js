import { Hono } from 'hono';
import { logger } from 'hono/logger';

export const createApp = () => {
  const app = new Hono();
  app.use('*', logger());
  app.get('/', c => c.text('Hello World!'));
  return app;
};
