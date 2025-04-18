import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js'; // ✅ only import the app

// Prevent log clutter during test
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Server', () => {
  it('GET / - should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Express is working!');
  });
});
