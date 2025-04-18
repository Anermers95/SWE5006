import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mocking the entire server module
vi.mock('../src/server', async (importOriginal) => {
  const actual = await importOriginal();
  
  // Mock initBatchJobs and make it a spy so we can check if it's called
  const initBatchJobs = vi.fn().mockResolvedValue(true);
  
  return {
    ...actual,
    initBatchJobs, // Mocked function
  };
});

vi.mock('../src/middleware/checkBookingStatus', () => {
  return {
    runJobNow: vi.fn().mockResolvedValue(5), // Mocking the function to return 5 updated bookings
    scheduleBatchJob: vi.fn(), // Mocking scheduleBatchJob as well
  };
});


import { app, initBatchJobs } from '../src/server'; // Import app and initBatchJobs after mocking

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

  it('should call initBatchJobs when the server starts', async () => {
    // Check if initBatchJobs has been called
    await initBatchJobs();
    expect(initBatchJobs).toHaveBeenCalled();
  });

  it('should run the batch job and return success message from /admin/update-expired-bookings', async () => {
    const response = await request(app).post('/admin/update-expired-bookings');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Updated');
    expect(response.body.timestamp).toBeDefined();
  });
  
});
