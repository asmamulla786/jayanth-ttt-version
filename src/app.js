import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import {
  addSessions,
  extractSessionId,
  ensureAuthenticated,
  ensureGuest,
  ensureActivePlayer,
  ensureWaitingPlayer,
  serveIndex,
  handleLogin,
  handleGetStatus,
  getGameState,
} from './handlers.js';

const createGuestRoutes = () => {
  const guestRoutes = new Hono();
  guestRoutes
    .use('/login', ensureGuest)
    .get('/login', serveStatic({ path: './public/login.html' }))
    .post(handleLogin);
  return guestRoutes;
};

const createAuthenticatedRoutes = () => {
  const authenticatedRoutes = new Hono();

  authenticatedRoutes.use(ensureAuthenticated);
  authenticatedRoutes.get('/', serveIndex);
  authenticatedRoutes.get('/status', handleGetStatus);

  authenticatedRoutes
    .use('/waiting', ensureWaitingPlayer)
    .get(serveStatic({ path: './public/waiting.html' }));

  authenticatedRoutes
    .use('/home', ensureActivePlayer)
    .get(serveStatic({ path: './public/home.html' }));

  authenticatedRoutes.get('/game-state', getGameState);
  authenticatedRoutes.get('/*', serveStatic({ root: './public' }));
  return authenticatedRoutes;
};

export const createApp = (sessions, logger) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();

  const app = new Hono();

  app.use(logger);
  app.use(addSessions(sessions));
  app.use(extractSessionId);

  app.route('/', guestRoutes);
  app.route('/', authenticatedRoutes);
  return app;
};
