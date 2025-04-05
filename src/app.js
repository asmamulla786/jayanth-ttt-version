import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { getCookie } from 'hono/cookie';

const addSessions = (sessions) => async (c, next) => {
  c.set('sessions', sessions);
  return await next();
}

const serveHome = (c) => {
  const sessionId = getCookie(c, 'sessionId');
  const sessions = c.get('sessions');
  if (sessionId && sessions.has(sessionId)) {
    return c.redirect('/home', 303);
  }
  return c.redirect('/login', 303);
}

export const createApp = (sessions) => {
  const app = new Hono();
  app.use(addSessions(sessions));
  app.use('*', logger());
  app.get('/', serveHome);

  return app;
};
