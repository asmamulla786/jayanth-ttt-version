import { assertEquals } from 'jsr:@std/assert';
import { describe, test, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';

describe("App", () => {
  describe('/', () => {
    it('should redirect to login page for an unsigned user', async () => {
      const app = createApp();
      const response = await app.request('/');
      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/login');
    });

    it('should redirect to game page for a valid user', async () => {
      const sessions = new Map();
      sessions.set('1', { name: 'Nobody' });
      const app = createApp(sessions);
      const r = new Request('http://localhost/', {
        method: 'GET',
        headers: {
          'Cookie': 'sessionId=1',
        },
      });
      const response = await app.request(r);
      assertEquals(response.status, 303);
      assertEquals(response.headers.get('location'), '/home');
    });

    it('should redirect to login page for an invalid user', async () => {
      const sessions = new Map();
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
})
