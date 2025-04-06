import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { getCookie, setCookie } from 'hono/cookie';
import { serveStatic } from 'hono/deno';

const addSessions = (sessions) => async (c, next) => {
  c.set('sessions', sessions);
  return await next();
}

const serveHome = (c) => {
  const sessionId = parseInt(getCookie(c, 'sessionId'));
  const sessions = c.get('sessions');

  if (sessions.isValidSession(sessionId)) {
    return c.redirect('/home', 303);
  }
  return c.redirect('/login', 303);
}


export const createApp = (sessions) => {
  const app = new Hono();
  app.use(addSessions(sessions));
  app.use('*', logger());
  app.get('/', serveHome);
  app.get('/login', serveStatic({ path: './public/login.html' }));

  app.post('/login', async (c) => {
    const formData = await c.req.formData();
    const sessions = c.get('sessions');
    const sessionId = sessions.createSession(formData.get('name'));
    setCookie(c, 'sessionId', sessionId);
    return c.redirect('/', 303);
  });

  app.get('/status', (c) => {
    const sessionId = parseInt(getCookie(c, 'sessionId'));
    const sessions = c.get('sessions');
    const status = sessions.getStatus(sessionId);
    return c.json({ status });
  });

  app.get('/*', serveStatic({ root: './public' }));
  return app;
};
