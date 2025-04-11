const express = require('express');
const router = express.Router(); 
const bookingController = require('../controllers/bookingController'); 
const authMiddleware = require('../middleware/authMiddleware'); 


router.get('/', bookingController.getAllBookings); 

router.get('/:id([0-9]+)', bookingController.getBookingById); 


router.get('/user/:userId', bookingController.getBookingsByUserId); 

router.get('/room/:roomId', bookingController.getBookingsByRoomId);

router.post('/', bookingController.createBooking);

router.put('/:id', bookingController.updateBooking);

router.patch('/:id/cancel', bookingController.cancelBooking); 

router.delete('/:id', bookingController.deleteBooking);

router.get('/logs', bookingController.getBookingLogs);

router.get('/logs/:id', bookingController.getBookingLogs); 

module.exports = router; 