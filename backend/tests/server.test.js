import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server'; // Import app without starting the server

describe('Express API Tests', () => {
  it('should return a welcome message on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Express is working!');
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
});
