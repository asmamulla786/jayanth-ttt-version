import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/deno';
import {
  addSessions,
  parseSessionId,
  ensureIsLoggedIn,
  ensureIsNotLoggedIn,
  ensureIsPlaying,
  ensureIsWaiting,
  serveIndex,
  handleLogin,
  handleGetStatus,
  getGameState,
} from "./handlers.js";

const createGuestRoutes = () => {
  const guestRoutes = new Hono();
  guestRoutes.use('/login', ensureIsNotLoggedIn)
    .get('/login', serveStatic({ path: './public/login.html' }))
    .post(handleLogin);
  return guestRoutes;
}

const createAuthenticatedRoutes = () => {
  const authenticatedRoutes = new Hono();

  authenticatedRoutes.use(ensureIsLoggedIn);
  authenticatedRoutes.get('/', serveIndex);
  authenticatedRoutes.get('/status', handleGetStatus);

  authenticatedRoutes.use('/waiting', ensureIsWaiting)
    .get(serveStatic({ path: './public/waiting.html' }));

  authenticatedRoutes.use('/home', ensureIsPlaying)
    .get(serveStatic({ path: './public/home.html' }));

  authenticatedRoutes.get('/game-state', getGameState);
  authenticatedRoutes.get('/*', serveStatic({ root: './public' }));
  return authenticatedRoutes;
}


export const createApp = (sessions) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();

  const app = new Hono();

  app.use(logger());
  app.use(addSessions(sessions));
  app.use(parseSessionId);

  app.route('/', guestRoutes);
  app.route('/', authenticatedRoutes);
  return app;
};