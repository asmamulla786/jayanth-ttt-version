import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/deno';
import {
  addSessions,
  parseSessionId,
  ensureIsLoggedIn,
  ensureIsPlaying,
  ensureIsWaiting,
  serveIndex,
  handleLogin,
  handleGetStatus,
  getGameState,
} from "./handlers.js";

export const createApp = (sessions) => {
  const app = new Hono();
  app.use(addSessions(sessions));
  app.use(parseSessionId);
  app.use(logger());
  app.get('/login', serveStatic({ path: './public/login.html' }))
    .post(handleLogin);

  app.use(ensureIsLoggedIn);
  app.get('/', serveIndex);
  app.get('/status', handleGetStatus);
  app.use('/waiting', ensureIsWaiting)
    .get(serveStatic({ path: './public/waiting.html' }));
  app.get('/home', ensureIsPlaying)
    .get(serveStatic({ path: './public/home.html' }));
  app.get('/game-state', getGameState);
  app.get('/*', serveStatic({ root: './public' }));
  return app;
};
