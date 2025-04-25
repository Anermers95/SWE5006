import { getAllBookings, getBookingById, getBookingsByUserId, getBookingsByRoomId, 
  createBooking, updateBooking, cancelBooking, deleteBooking, getBookingLogs } from '../../src/controllers/bookingController';
import pool from './../../src/config/db';
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';

describe('Booking Controller', () => {
  let testBookingId;
  let testUserId;
  let testRoomId;
  
  // Create test data before all tests
  beforeAll(async () => {
    // Create a test user
    const userResult = await pool.query(
      `INSERT INTO t_users (user_full_name, user_email, user_password, is_active, user_role_id, created_on, updated_on) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING user_id`,
      ['Test User', 'test@example.com', 'password123', true, 1]
    );
    testUserId = userResult.rows[0].user_id;
    
    // Create a test room
    const roomResult = await pool.query(
      `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING room_id`,
      ['Test Room', 10, 'Lecture', 'Test Building', true]
    );
    testRoomId = roomResult.rows[0].room_id;
    
    // Create a test booking
    const bookingResult = await pool.query(
      `INSERT INTO t_bookings (user_id, room_id, start_time, end_time, booking_purpose, is_active, created_on, updated_on) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING booking_id`,
      [testUserId, testRoomId, '2025-04-25T10:00:00Z', '2025-04-25T11:00:00Z', 'Test Booking', true]
    );
    testBookingId = bookingResult.rows[0].booking_id;
  });
  
  // Clean up after all tests
  afterAll(async () => {
    // Delete the test booking
    await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [testBookingId]);
    
    // Delete the test room
    await pool.query('DELETE FROM t_rooms WHERE room_id = $1', [testRoomId]);
    
    // Delete the test user
    await pool.query('DELETE FROM t_users WHERE user_id = $1', [testUserId]);
    
    // Delete any test bookings that might have been created
    await pool.query("DELETE FROM t_bookings WHERE booking_purpose LIKE 'Test%'");
  });
  
  // Test getting all bookings
  it('should get all bookings', async () => {
    const req = {};
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getAllBookings(req, res);
    
    expect(res.json).toHaveBeenCalled();
    expect(Array.isArray(res.json.mock.calls[0][0])).toBe(true);
  });
  
  // Test getting a booking by ID
  it('should get a booking by ID', async () => {
    const req = { params: { id: testBookingId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingById(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.booking_id).toBe(testBookingId);
  });
  
  it('should return 404 when booking ID not found', async () => {
    const req = { params: { id: 99999 } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingById(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
  });
  
  // Test getting bookings by user ID
  it('should get bookings by user ID', async () => {
    const req = { params: { userId: testUserId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingsByUserId(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(Array.isArray(responseData)).toBe(true);
    if (responseData.length > 0) {
      expect(responseData[0].user_id).toBe(testUserId);
    }
  });
  
  // Test getting bookings by room ID
  it('should get bookings by room ID', async () => {
    const req = { params: { roomId: testRoomId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingsByRoomId(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(Array.isArray(responseData)).toBe(true);
    if (responseData.length > 0) {
      expect(responseData[0].room_id).toBe(testRoomId);
    }
  });
  
  // Test creating a booking
  it('should create a new booking', async () => {
    const req = {
      body: {
        userId: testUserId,
        roomId: testRoomId,
        startTime: '2025-04-26T10:00:00Z',
        endTime: '2025-04-26T11:00:00Z',
        bookingPurpose: 'Test Create Booking'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.message).toBe('Booking created successfully');
    expect(responseData.booking).toHaveProperty('booking_id');
    
    // Clean up the created booking
    if (responseData.booking && responseData.booking.booking_id) {
      await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [responseData.booking.booking_id]);
    }
  });

  // Get booking logs
  it('should get booking logs', async () => {
    const req = { params: { id: testBookingId } };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    await getBookingLogs(req, res);
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(Array.isArray(responseData)).toBe(true);
    if (responseData.length > 0) {
      expect(responseData[0].booking_id).toBe(testBookingId);
    }
  });

  it('should return all logs if no booking ID is provided', async () => {
    const req = { params: {} }; // No ID
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  
    await getBookingLogs(req, res);
  
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    
    expect(Array.isArray(responseData)).toBe(true);
    // Optionally check if logs are returned (if applicable)
  });

  it('should return an empty array if booking ID does not exist', async () => {
    const invalidBookingId = 999999; // Non-existent ID
    const req = { params: { id: invalidBookingId.toString() } };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  
    await getBookingLogs(req, res);
  
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData.length).toBe(0); // Expect no logs for invalid ID
  });

  it('should fail to create a booking if missing required fields', async () => {
    const req = {
      body: {
        userId: testUserId,
        // Missing roomId
        startTime: '2025-04-26T10:00:00Z',
        endTime: '2025-04-26T11:00:00Z'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
  });
  
  it('should fail to create a booking if end time is before start time', async () => {
    const req = {
      body: {
        userId: testUserId,
        roomId: testRoomId,
        startTime: '2025-04-26T11:00:00Z',
        endTime: '2025-04-26T10:00:00Z', // End before start
        bookingPurpose: 'Test Invalid Time Booking'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'End time must be after start time' });
  });
  
  it('should fail to create a booking if room not found', async () => {
    const req = {
      body: {
        userId: testUserId,
        roomId: 99999, // Non-existent room
        startTime: '2025-04-26T10:00:00Z',
        endTime: '2025-04-26T11:00:00Z',
        bookingPurpose: 'Test Room Not Found Booking'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
  });
  
  it('should fail to create a booking if user not found', async () => {
    const req = {
      body: {
        userId: 99999, // Non-existent user
        roomId: testRoomId,
        startTime: '2025-04-26T10:00:00Z',
        endTime: '2025-04-26T11:00:00Z',
        bookingPurpose: 'Test User Not Found Booking'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
  
  // Test updating a booking
  it('should update a booking', async () => {
    const req = {
      params: { id: testBookingId },
      body: {
        startTime: '2025-04-25T12:00:00Z',
        endTime: '2025-04-25T13:00:00Z',
        bookingPurpose: 'Updated Test Booking'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await updateBooking(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.message).toBe('Booking updated successfully');
    expect(responseData.booking.booking_id).toBe(testBookingId);
    expect(responseData.booking.booking_purpose).toBe('Updated Test Booking');
  });
  
  it('should fail to update a booking if booking not found', async () => {
    const req = {
      params: { id: 99999 },
      body: {
        startTime: '2025-04-25T12:00:00Z',
        endTime: '2025-04-25T13:00:00Z'
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await updateBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
  });
  
  it('should fail to update a booking if end time is before start time', async () => {
    const req = {
      params: { id: testBookingId },
      body: {
        startTime: '2025-04-25T13:00:00Z',
        endTime: '2025-04-25T12:00:00Z' // End before start
      }
    };
    
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await updateBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'End time must be after start time' });
  });
  
  // Test canceling a booking
  it('should cancel a booking', async () => {
    // First create a booking to cancel
    const createReq = {
      body: {
        userId: testUserId,
        roomId: testRoomId,
        startTime: '2025-04-27T10:00:00Z',
        endTime: '2025-04-27T11:00:00Z',
        bookingPurpose: 'Test Cancel Booking'
      }
    };
    
    const createRes = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(createReq, createRes);
    
    const newBookingId = createRes.json.mock.calls[0][0].booking.booking_id;
    
    // Now cancel it
    const req = { params: { id: newBookingId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await cancelBooking(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.message).toBe('Booking canceled successfully');
    expect(responseData.booking.booking_id).toBe(newBookingId);
    expect(responseData.booking.is_active).toBe(false);
    
    // Clean up
    await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [newBookingId]);
  });
  
  it('should fail to cancel a booking if booking not found', async () => {
    const req = { params: { id: 99999 } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await cancelBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
  });
  
  // Test deleting a booking
  it('should delete a booking', async () => {
    // First create a booking to delete
    const createReq = {
      body: {
        userId: testUserId,
        roomId: testRoomId,
        startTime: '2025-04-28T10:00:00Z',
        endTime: '2025-04-28T11:00:00Z',
        bookingPurpose: 'Test Delete Booking'
      }
    };
    
    const createRes = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await createBooking(createReq, createRes);
    
    const newBookingId = createRes.json.mock.calls[0][0].booking.booking_id;
    
    // Now delete it
    const req = { params: { id: newBookingId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await deleteBooking(req, res);
    
    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking deleted successfully' });
    
    // Verify it's deleted
    const verifyReq = { params: { id: newBookingId } };
    const verifyRes = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingById(verifyReq, verifyRes);
    expect(verifyRes.status).toHaveBeenCalledWith(404);
  });
  
  it('should fail to delete a booking if booking not found', async () => {
    const req = { params: { id: 99999 } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await deleteBooking(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
  });
  
  // Test getting booking logs
  it('should get booking logs', async () => {
    const req = { params: { id: testBookingId } };
    const res = { 
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    
    await getBookingLogs(req, res);
    
    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(Array.isArray(responseData)).toBe(true);
  });
});