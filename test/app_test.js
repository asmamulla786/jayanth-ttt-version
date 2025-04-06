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

    it('should redirect to game page for a valid user', async () => {
      const sessions = new Sessions();
      const id = sessions.createSession('Nobody');
      const app = createApp(sessions);
      const r = new Request('http://localhost/', {
        method: 'GET',
        headers: {
          'Cookie': `sessionId=${id}`,
        },
      });
      const response = await app.request(r);
      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/home');
    });

    it('should redirect to login page for an invalid user', async () => {
      const sessions = new Sessions();
      const app = createApp(sessions);
      const r = new Request('http://localhost/', {
        method: 'GET',
        headers: {
          'Cookie': 'sessionId=99',
        },
      });
      const response = await app.request(r);
      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/login');
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

      const secondReq = new Request('http://localhost/', {
        method: 'GET',
        headers: {
          'Cookie': cookie,
        },
      });
      const response2 = await app.request(secondReq);
      assertEquals(response2.status, 303);
      assertEquals(response2.headers.get('location'), '/home');
    });
  });

  describe('/status', () => {
    it('should indicate that it is waiting for the second player', async () => {
      const sessions = new Sessions();
      sessions.createSession("Player1");
      const app = createApp(sessions);
      const r = new Request('http://localhost/status', {
        method: 'GET',
        headers: {
          'Cookie': 'sessionId=1',
        },
      });
      const response = await app.request(r);
      const status = await response.json();
      assertEquals(response.status, 200);
      assertEquals(status.status, "waiting");
    });
  });
});
