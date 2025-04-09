import { assertEquals } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';
import { Sessions } from "../src/sessions.js";

describe('App', () => {
  describe('/', () => {
    it('should redirect to login page for an unsigned user', async () => {
      const sessions = new Sessions();
      const app = createApp(sessions);

      const response = await app.request('/');

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/login');
    });

    it('should redirect to a waiting page for a valid user who is waiting', async () => {
      const sessions = new Sessions();
      const id = sessions.createSession('Nobody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/');
      r.headers.set('Cookie', `sessionId=${id}`);

      const response = await app.request(r);

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/waiting');
    });

    it('should redirect to login page for an invalid user', async () => {
      const sessions = new Sessions();
      const app = createApp(sessions);

      const r = new Request('http://localhost/');
      r.headers.set('Cookie', 'sessionId=99');

      const response = await app.request(r);

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/login');
    });

    it('should redirect to home page for a valid user who is playing', async () => {
      const sessions = new Sessions();
      const id = sessions.createSession('Nobody');
      sessions.createSession('Somebody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/');
      r.headers.set('Cookie', `sessionId=${id}`);

      const response = await app.request(r);

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/home');
    });
  });

  describe('/login', { sanitizeResources: true }, () => {
    it('should serve the login page on GET', async () => {
      const app = createApp();

      const response = await app.request('/login');
      await response.text();

      assertEquals(response.status, 200);
      assertEquals(response.headers.get('content-type'), 'text/html; charset=utf-8');
    });

    it('should redirect to / on POST and set a cookie', async () => {
      const app = createApp(new Sessions());

      const firstReq = new Request('http://localhost/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name=Nobody',
      });

      const response = await app.request(firstReq);
      const cookie = response.headers.get('set-cookie');

      assertEquals(response.status, 303);
      assertEquals(cookie, 'sessionId=1; Path=/');

      const secondReq = new Request('http://localhost/');
      secondReq.headers.set('Cookie', cookie);

      const response2 = await app.request(secondReq);

      assertEquals(response2.status, 303);
      assertEquals(response2.headers.get('location'), '/waiting');
    });
  });

  describe('/status', () => {
    it('should indicate that it is waiting for the second player', async () => {
      const sessions = new Sessions();
      sessions.createSession("Player1");
      const app = createApp(sessions);

      const r = new Request('http://localhost/status');
      r.headers.set('Cookie', 'sessionId=1');

      const response = await app.request(r);
      const status = await response.json();

      assertEquals(response.status, 200);
      assertEquals(status.status, "waiting");
    });

    it('should create a new game when the second player joins', async () => {
      const sessions = new Sessions();
      const sessionId1 = sessions.createSession("Player1");
      const sessionId2 = sessions.createSession("Player2");
      const app = createApp(sessions);

      const r1 = new Request('http://localhost/status');
      r1.headers.set('Cookie', `sessionId=${sessionId1}`);

      const response1 = await app.request(r1);
      const status1 = await response1.json();

      assertEquals(response1.status, 200);
      assertEquals(status1.status, "playing");

      const r2 = new Request('http://localhost/status');
      r2.headers.set('Cookie', `sessionId=${sessionId2}`);

      const response2 = await app.request(r2);
      const status2 = await response2.json();

      assertEquals(response2.status, 200);
      assertEquals(status2.status, "playing");
    });
  });

  describe('/waiting', () => {
    it('should redirect to /home if the user is playing', async () => {
      const sessions = new Sessions();
      const sessionId = sessions.createSession('Nobody');
      sessions.createSession('Somebody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/waiting');
      r.headers.set('Cookie', `sessionId=${sessionId}`);

      const response = await app.request(r);

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/');
    });

    it('should serve the waiting page if the user is waiting', async () => {
      const sessions = new Sessions();
      const sessionId = sessions.createSession('Nobody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/waiting');
      r.headers.set('Cookie', `sessionId=${sessionId}`);

      const response = await app.request(r);
      await response.text();

      assertEquals(response.status, 200);
    });
  });

  describe('/home', () => {
    it('should serve the home page if the user is playing', async () => {
      const sessions = new Sessions();
      const sessionId = sessions.createSession('Nobody');
      sessions.createSession('Somebody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/home');
      r.headers.set('Cookie', `sessionId=${sessionId}`);

      const response = await app.request(r);
      await response.text();

      assertEquals(response.status, 200);
    });

    it('should redirect to / if the user is not playing', async () => {
      const sessions = new Sessions();
      const sessionId = sessions.createSession('Nobody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/home');
      r.headers.set('Cookie', `sessionId=${sessionId}`);

      const response = await app.request(r);

      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/');
    });
  });

  describe('GET /game-state', () => {
    it('First status of the current player', async () => {
      const sessions = new Sessions();
      const sessionId = sessions.createSession('Nobody');
      sessions.createSession('Somebody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/game-state');
      r.headers.set('Cookie', `sessionId=${sessionId}`);

      const response = await app.request(r);

      assertEquals(response.status, 200);
      const gameState = await response.json();

      assertEquals(gameState, {
        'you': { name: 'Nobody', symbol: 'X' },
        'opponent': { name: 'Somebody', symbol: 'O' },
        'isYourTurn': true,
        'board': ['', '', '', '', '', '', '', '', ''],
      });
    });

    it('First status of the opponent', async () => {
      const sessions = new Sessions();
      sessions.createSession('Nobody');
      const opponentSessionId = sessions.createSession('Somebody');
      const app = createApp(sessions);

      const r = new Request('http://localhost/game-state');
      r.headers.set('Cookie', `sessionId=${opponentSessionId}`);

      const response = await app.request(r);

      assertEquals(response.status, 200);
      const gameState = await response.json();

      assertEquals(gameState, {
        'you': { name: 'Somebody', symbol: 'O' },
        'opponent': { name: 'Nobody', symbol: 'X' },
        'isYourTurn': false,
        'board': ['', '', '', '', '', '', '', '', ''],
      });
    });
  });
});
