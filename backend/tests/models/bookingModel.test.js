import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as bookingModel from '../../src/models/bookingModel';
import pool from '../../src/config/db';

let testBookingId;
let testUserId = 10;
let testRoomId = 34;

beforeAll(async () => {
  // Insert a test booking
  const { rows } = await pool.query(
    `INSERT INTO t_bookings (user_id, room_id, start_time, end_time, booking_purpose, is_active, created_on, updated_on)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING booking_id`,
    [testUserId, testRoomId, '2025-04-20 10:00:00+00', '2025-04-20 12:00:00+00', 'Initial Test Booking']
  );
  testBookingId = rows[0].booking_id;
});

afterAll(async () => {
  // Clean up test data
  await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [testBookingId]);
});

describe('bookingModel', () => {
  it('should retrieve all bookings', async () => {
    const bookings = await bookingModel.getAll();
    expect(Array.isArray(bookings)).toBe(true);
  });

  it('should retrieve a booking by ID', async () => {
    const booking = await bookingModel.getById(testBookingId);
    expect(booking).toBeDefined();
    expect(booking.booking_id).toBe(testBookingId);
  });

  it('should retrieve bookings by user ID', async () => {
    const bookings = await bookingModel.getByUserId(testUserId);
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.some(b => b.booking_id === testBookingId)).toBe(true);
  });

  it('should retrieve bookings by room ID', async () => {
    const bookings = await bookingModel.getByRoomId(testRoomId);
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.some(b => b.booking_id === testBookingId)).toBe(true);
  });

  it('should detect booking conflicts', async () => {
    const hasConflict = await bookingModel.checkConflict(
      testRoomId,
      '2025-04-20 10:30:00+00',
      '2025-04-20 11:30:00+00'
    );
    expect(hasConflict).toBe(true);
  });

  it('should create a new booking', async () => {
    const newBooking = await bookingModel.create({
      userId: testUserId,
      roomId: testRoomId,
      startTime: '2025-04-21 10:00:00+00',
      endTime: '2025-04-21 12:00:00+00',
      bookingPurpose: 'New Test Booking',
    });
    expect(newBooking).toBeDefined();
    expect(newBooking.booking_purpose).toBe('New Test Booking');

    // Clean up
    await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [newBooking.booking_id]);
  });

  it('should update a booking', async () => {
    const updatedBooking = await bookingModel.update(testBookingId, {
      startTime: '2025-04-20 13:00:00+00',
      endTime: '2025-04-20 15:00:00+00',
      bookingPurpose: 'Updated Test Booking',
      isActive: true,
    });
    expect(updatedBooking).toBeDefined();
    expect(updatedBooking.booking_purpose).toBe('Updated Test Booking');
  });

  it('should cancel a booking', async () => {
    const canceledBooking = await bookingModel.cancelBooking(testBookingId);
    expect(canceledBooking).toBeDefined();
    expect(canceledBooking.is_active).toBe(false);
  });

  it('should delete a booking', async () => {
    // First, create a booking to delete
    const bookingToDelete = await bookingModel.create({
      userId: testUserId,
      roomId: testRoomId,
      startTime: '2025-04-22 10:00:00+00',
      endTime: '2025-04-22 12:00:00+00',
      bookingPurpose: 'Booking to Delete',
    });

    const deletionResult = await bookingModel.deleteBooking(bookingToDelete.booking_id);
    expect(deletionResult).toBe(true);
  });

  it('should retrieve booking logs', async () => {
    const logs = await bookingModel.getBookingLogs(testBookingId);
    expect(Array.isArray(logs)).toBe(true);
  });
});
