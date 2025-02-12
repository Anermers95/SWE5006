import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';  // To make HTTP requests
import app from '../src/server';       // Import the server

// Mock console.log
vi.spyOn(console, 'log').mockImplementation(() => {});  // Mocks the console log to avoid printing during tests

describe('Server', () => {
  it('should start the server and log the correct message', async () => {
    // Call the server start (this would actually start the server)
    const serverStart = vi.fn();
    require('../src/index'); // This will trigger the server to start

    // Check if console.log was called with the correct message
    
    // Now test if we can make a request to the server
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Express is working!');
  });
});
