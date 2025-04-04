import { assertEquals } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';

describe('App', () => {
  it('should respond with Hello World!', async () => {
    const app = createApp();
    const response = await app.request('/');
    assertEquals(response.status, 200);
    const text = await response.text();
    assertEquals(text, 'Hello World!');
  });
});
