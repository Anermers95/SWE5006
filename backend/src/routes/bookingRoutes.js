const express = require('express'); // Import the Express framework
const router = express.Router(); // Create a new router object
const bookingController = require('../controllers/bookingController'); // Import the booking controller with all the handler functions
const authMiddleware = require('../middleware/authMiddleware'); // Import the authentication middleware

// Public routes (accessible without authentication)
// GET /api/bookings - Retrieve all bookings
router.get('/', bookingController.getAllBookings); 
// GET /api/bookings/:id - Retrieve a booking by ID (ID must be numeric)
router.get('/:id([0-9]+)', bookingController.getBookingById); 

// Protected routes (require authentication)
// GET /api/bookings/user/:userId - Get all bookings for a specific user
router.get('/user/:userId', bookingController.getBookingsByUserId); 
 // GET /api/bookings/room/:roomId - Get all bookings for a specific room
router.get('/room/:roomId', bookingController.getBookingsByRoomId);
 // POST /api/bookings - Create a new booking
router.post('/', bookingController.createBooking);
 // PUT /api/bookings/:id - Update an existing booking
router.put('/:id', bookingController.updateBooking);
// PATCH /api/bookings/:id/cancel - Cancel a booking (soft delete)
router.patch('/:id/cancel', bookingController.cancelBooking); 
 // DELETE /api/bookings/:id - Permanently delete a booking
router.delete('/:id', bookingController.deleteBooking);
 // GET /api/bookings/logs - Get all booking logs
router.get('/logs', bookingController.getBookingLogs);
// GET /api/bookings/logs/:id - Get logs for a specific booking
router.get('/logs/:id', bookingController.getBookingLogs); 

module.exports = router; // Export the router for use in the main application