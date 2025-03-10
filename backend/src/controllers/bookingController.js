const bookingModel = require('../models/bookingModel');
const roomModel = require('../models/roomModel');
const userModel = require('../models/userModel'); // Assuming you have a userModel

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.getAll();
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a booking by ID
const getBookingById = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        const booking = await bookingModel.getById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const bookings = await bookingModel.getByUserId(userId);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bookings by room ID
const getBookingsByRoomId = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId, 10);
        const bookings = await bookingModel.getByRoomId(roomId);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const { userId, roomId, startTime, endTime, bookingPurpose } = req.body;
        
        // Validate required fields
        if (!userId || !roomId || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate time range
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }
        
        // Check if room exists
        const room = await roomModel.getById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        // Check if user exists (assuming you have a userModel)
        // const user = await userModel.getById(userId);
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found' });
        // }
        
        // Check for booking conflicts
        const hasConflict = await bookingModel.checkConflict(roomId, startTime, endTime);
        if (hasConflict) {
            return res.status(409).json({ message: 'Room is already booked for this time slot' });
        }
        
        // Create booking
        const newBooking = await bookingModel.create({
            userId, 
            roomId, 
            startTime, 
            endTime, 
            bookingPurpose
        });
        
        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking: newBooking 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update booking
const updateBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        const { startTime, endTime, bookingPurpose, isActive } = req.body;
        
        // Check if booking exists
        const booking = await bookingModel.getById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Validate time range if provided
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            if (start >= end) {
                return res.status(400).json({ message: 'End time must be after start time' });
            }
            
            // Check for booking conflicts (excluding this booking)
            const hasConflict = await bookingModel.checkConflict(
                booking.room_id, 
                startTime, 
                endTime, 
                bookingId
            );
            
            if (hasConflict) {
                return res.status(409).json({ message: 'Room is already booked for this time slot' });
            }
        }
        
        // Update booking
        const updatedBooking = await bookingModel.update(bookingId, {
            startTime: startTime || booking.start_time,
            endTime: endTime || booking.end_time,
            bookingPurpose: bookingPurpose || booking.booking_purpose,
            isActive: isActive !== undefined ? isActive : booking.is_active
        });
        
        res.json({ 
            message: 'Booking updated successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        
        // Check if booking exists
        const booking = await bookingModel.getById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Cancel booking (soft delete - set is_active to false)
        const canceledBooking = await bookingModel.cancelBooking(bookingId);
        
        res.json({ 
            message: 'Booking canceled successfully', 
            booking: canceledBooking 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete booking
const deleteBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        
        // Hard delete the booking
        const deleted = await bookingModel.deleteBooking(bookingId);
        if (!deleted) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get booking logs
const getBookingLogs = async (req, res) => {
    try {
        const bookingId = req.params.id ? parseInt(req.params.id, 10) : null;
        const logs = await bookingModel.getBookingLogs(bookingId);
        
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllBookings,
    getBookingById,
    getBookingsByUserId,
    getBookingsByRoomId,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingLogs
};