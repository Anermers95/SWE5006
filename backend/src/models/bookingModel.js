const pool = require('../config/db'); // PostgreSQL connection

// Get all bookings
const getAll = async () => {
    const { rows } = await pool.query(`
        SELECT b.*, r.room_name, u.user_full_name 
        FROM t_bookings b
        JOIN t_rooms r ON b.room_id = r.room_id
        JOIN t_users u ON b.user_id = u.user_id
    `);
    return rows;
};

// Get booking by ID
const getById = async (id) => {
    const { rows } = await pool.query(`
        SELECT b.*, r.room_name, u.user_full_name 
        FROM t_bookings b
        JOIN t_rooms r ON b.room_id = r.room_id
        JOIN t_users u ON b.user_id = u.user_id
        WHERE b.booking_id = $1
    `, [id]);
    return rows[0]; // Return single booking object
};

// Get bookings by user ID
const getByUserId = async (userId) => {
    const { rows } = await pool.query(`
        SELECT b.*, r.room_name, u.user_full_name 
        FROM t_bookings b
        JOIN t_rooms r ON b.room_id = r.room_id
        JOIN t_users u ON b.user_id = u.user_id
        WHERE b.user_id = $1
    `, [userId]);
    return rows;
};

// Get bookings by room ID
const getByRoomId = async (roomId) => {
    const { rows } = await pool.query(`
        SELECT b.*, r.room_name, u.user_full_name 
        FROM t_bookings b
        JOIN t_rooms r ON b.room_id = r.room_id
        JOIN t_users u ON b.user_id = u.user_id
        WHERE b.room_id = $1
    `, [roomId]);
    return rows;
};

// Check for booking conflicts
const checkConflict = async (roomId, startTime, endTime, excludeBookingId = null) => {
    let query = `
        SELECT COUNT(*) FROM t_bookings 
        WHERE room_id = $1 
        AND is_active = true
        AND (
            (start_time <= $2 AND end_time > $2) OR
            (start_time < $3 AND end_time >= $3) OR
            (start_time >= $2 AND end_time <= $3)
        )
    `;
    
    let params = [roomId, startTime, endTime];
    
    // If updating an existing booking, exclude it from conflict check
    if (excludeBookingId) {
        query += ' AND booking_id != $4';
        params.push(excludeBookingId);
    }
    
    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count) > 0;
};

// Create a new booking
const create = async ({ userId, roomId, startTime, endTime, bookingPurpose }) => {
    const { rows } = await pool.query(
        `INSERT INTO t_bookings (user_id, room_id, start_time, end_time, booking_purpose, is_active, created_on, updated_on) 
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *`,
        [userId, roomId, startTime, endTime, bookingPurpose]
    );
    return rows[0]; // Return created booking
};

// Update booking by ID
const update = async (id, { startTime, endTime, bookingPurpose, isActive }) => {
    const { rows } = await pool.query(
        `UPDATE t_bookings
         SET start_time = $1, end_time = $2, booking_purpose = $3, is_active = $4, updated_on = NOW()
         WHERE booking_id = $5 RETURNING *`,
        [startTime, endTime, bookingPurpose, isActive, id]
    );
    return rows[0]; // Return updated booking
};

// Cancel booking (soft delete - set is_active to false)
const cancelBooking = async (id) => {
    const { rows } = await pool.query(
        `UPDATE t_bookings SET is_active = false, updated_on = NOW() 
         WHERE booking_id = $1 RETURNING *`,
        [id]
    );
    return rows[0]; // Return canceled booking
};

// Delete booking (hard delete)
const deleteBooking = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM t_bookings WHERE booking_id = $1', [id]);
    return rowCount > 0; // Return true if deleted, false otherwise
};

// Get booking logs
const getBookingLogs = async (bookingId = null) => {
    let query = `
        SELECT l.*, b.start_time, b.end_time, b.booking_purpose,
        r.room_name, u.user_full_name
        FROM t_booking_logs l
        JOIN t_bookings b ON l.booking_id = b.booking_id
        JOIN t_rooms r ON l.room_id = r.room_id
        JOIN t_users u ON l.user_id = u.user_id
    `;
    
    let params = [];
    
    if (bookingId) {
        query += ' WHERE l.booking_id = $1';
        params.push(bookingId);
    }
    
    query += ' ORDER BY l.created_on DESC';
    
    const { rows } = await pool.query(query, params);
    return rows;
};

module.exports = { 
    getAll, 
    getById, 
    getByUserId, 
    getByRoomId,
    checkConflict,
    create, 
    update, 
    cancelBooking,
    deleteBooking,
    getBookingLogs
};