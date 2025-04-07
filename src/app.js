import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { getCookie, setCookie } from 'hono/cookie';
import { serveStatic } from 'hono/deno';

const parseSessionId = async (c, next) => {
  const sessionId = parseInt(getCookie(c, 'sessionId'));
  if (!isNaN(sessionId)) {
    c.set('sessionId', sessionId);
  }
  return await next();
}

const addSessions = (sessions) => async (c, next) => {
  c.set('sessions', sessions);
  return await next();
}

const ensureIsLoggedIn = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (!sessions.isValidSession(sessionId)) {
    return c.redirect('/login', 303);
  }
  return await next();
}

const ensureIsWaiting = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (sessions.getStatus(sessionId) !== 'waiting') {
    return c.redirect('/', 303);
  }

  return await next();
}

const ensureIsPlaying = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (sessions.getStatus(sessionId) !== 'playing') {
    return c.redirect('/', 303);
  }

  return await next();
}

const serveIndex = (c) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (sessions.getStatus(sessionId) === 'waiting') {
    return c.redirect('/waiting', 303);
  }

  return c.redirect('/home', 303);
}

const handleLogin = async (c) => {
  const formData = await c.req.formData();
  const sessions = c.get('sessions');
  const sessionId = sessions.createSession(formData.get('name'));
  setCookie(c, 'sessionId', sessionId);
  return c.redirect('/', 303);
};

const handleGetStatus = (c) => {
  const sessionId = parseInt(getCookie(c, 'sessionId'));
  const sessions = c.get('sessions');
  const status = sessions.getStatus(sessionId);
  return c.json({ status });
}

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
  app.get('/game-state', (c) => {
    const sessionId = c.get('sessionId');
    const sessions = c.get('sessions');
    const gameState = sessions.getGameState(sessionId);
    return c.json(gameState);
  });
  app.get('/*', serveStatic({ root: './public' }));
  return app;
};
