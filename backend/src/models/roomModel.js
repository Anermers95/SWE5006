const pool = require('../config/db'); // PostgreSQL connection

// Get all rooms
const getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM t_rooms');
    return rows;
};

// Get room by ID
const getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM t_rooms WHERE room_id = $1', [id]);
    return rows[0]; // Return single room object
};

// Get room by name
const getByName = async (name) => {
    const { rows } = await pool.query('SELECT * FROM t_rooms WHERE room_name = $1', [name]);
    return rows[0]; // Return single room object
}; 

// Create a new room
const create = async ({ roomName, capacity, room_type, buildingName, is_active }) => {
    console.log(roomName);
    const { rows } = await pool.query(
        `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [roomName, capacity, room_type, buildingName, is_active]
    );
    return rows[0]; // Return created room
};



// Update room by ID
const update = async (id, {roomName, capacity, room_type, buildingName, is_active }) => {
    console.log(roomName);
    const { rows } = await pool.query(
        `UPDATE t_rooms
        SET room_name = $1, room_seating_capacity = $2, room_type = $3, building_name = $4, is_active = $5, created_on = NOW(), updated_on = NOW()
        WHERE room_ID = $6 RETURNING *`,
        [roomName, capacity, room_type, buildingName, is_active, id]
    );
    return rows[0]; // Return created room
};

// Delete room by ID
const deleteRoom = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM t_rooms WHERE room_ID = $1', [id]);
    return rowCount > 0; // Return true if deleted, false otherwise
};

module.exports = { getAll, getById, create, update, deleteRoom,getByName };
