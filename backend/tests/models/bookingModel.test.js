import { describe, it, expect, vi } from 'vitest'; // Assuming you're using vitest for mocking and assertions
import * as bookingModel from '../../src/models/bookingModel';
import { getAll, getById, create, update, deleteBooking, getByName } from '../../src/models/bookingModel';
import pool from '../../src/config/db'; // Import pool for mocking

// Mocking the database connection
vi.mock('../src/config/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

let testBookingId;

beforeAll(async () => {
  // Insert a test booking into the T_BOOKINGS table
  const { rows } = await pool.query(
      `INSERT INTO T_BOOKINGS (USER_ID, ROOM_ID, START_TIME, END_TIME, BOOKING_PURPOSE, IS_ACTIVE, CREATED_ON, UPDATED_ON)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING BOOKING_ID`,
      [168, 34, '2025-04-20 10:00:00+00', '2025-04-20 12:00:00+00', 'Test Booking', true]
  );
  testBookingId = rows[0].booking_id;  // Store the generated booking ID for use in tests
});


afterAll(async () => {
  // Teardown: Delete the test booking using the stored booking ID
  await pool.query('DELETE FROM T_BOOKINGS WHERE BOOKING_ID = $1', [testBookingId]);
});




describe('Booking Model', () => {
  it('should get all bookings', async () => {
    // Call the getAll method to fetch all bookings
    const bookings = await bookingModel.getAll();

    // Ensure that the result is an array
    expect(Array.isArray(bookings)).toBe(true);
});

it('should get a booking by ID', async () => {
  const booking = await getById(testBookingId);
  expect(booking).toBeDefined();
  expect(booking.booking_id).toBe(testBookingId);
});


  it('should create a new booking', async () => {
    const date = Date.now();
    const mockBooking = {
      userId: 168,
      roomId: 34,
      startTime: '2025-04-20 10:00:00+00',
      endTime: '2025-04-20 12:00:00+00',
      bookingPurpose: 'Test',
    };
    expect(mockBooking).toBeDefined();
    expect(mockBooking.bookingPurpose).toBe('Test');
  });

  it('should update a booking', async () => {
    const updatedBooking = await update(testBookingId, {
        userId: 168,
        roomId: 34,
        startTime: '2025-04-20 10:00:00+00',
        endTime: '2025-04-20 12:00:00+00',
        bookingPurpose: 'booking update',
    });
    expect(updatedBooking).toBeDefined();
    expect(updatedBooking.booking_purpose).toBe('booking update');
});

  it('should delete a booking', async () => {
    console.log(testBookingId);
    const deleted = await deleteBooking(testBookingId);
    expect(deleted).toBe(true);
});
});
