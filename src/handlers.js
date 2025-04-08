import { getCookie, setCookie } from 'hono/cookie';

const extractSessionId = async (c, next) => {
  const sessionId = parseInt(getCookie(c, 'sessionId'));
  if (!isNaN(sessionId)) {
    c.set('sessionId', sessionId);
  }
  return await next();
};

const addSessions = (sessions) => async (c, next) => {
  c.set('sessions', sessions);
  return await next();
}

const ensureAuthenticated = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (!sessions.isValidSession(sessionId)) {
    return c.redirect('/login', 303);
  }
  return await next();
}

const ensureGuest = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (sessionId && sessions.isValidSession(sessionId)) {
    return c.redirect('/', 303);
  }

  return await next();
}


const ensureWaitingPlayer = async (c, next) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');

  if (sessions.getStatus(sessionId) !== 'waiting') {
    return c.redirect('/', 303);
  }

  return await next();
}

const ensureActivePlayer = async (c, next) => {
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
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');
  const status = sessions.getStatus(sessionId);
  return c.json({ status });
}

const getGameState = (c) => {
  const sessionId = c.get('sessionId');
  const sessions = c.get('sessions');
  const gameState = sessions.getGameState(sessionId);
  return c.json(gameState);
}


export {
  extractSessionId,
  addSessions,
  ensureAuthenticated,
  ensureGuest,
  ensureWaitingPlayer,
  ensureActivePlayer,
  serveIndex,
  handleLogin,
  handleGetStatus,
  getGameState,
};
