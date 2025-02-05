const pool = require('../config/db'); // PostgreSQL connection

// Get all users
const getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
};

// Get user by ID
const getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return rows[0]; // Return single user object
};

// Create a new user
const create = async ({ email, full_name, password, role_id, is_active }) => {
    const { rows } = await pool.query(
        `INSERT INTO users (email, full_name, password, role_id, created_at, updated_at, is_active) 
         VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING *`,
        [email, full_name, password, role_id, is_active]
    );
    return rows[0]; // Return created user
};

// Update user by ID
const update = async (id, { email, full_name, password, role_id, is_active }) => {
    const { rows } = await pool.query(
        `UPDATE users 
         SET email = $1, full_name = $2, password = $3, role_id = $4, updated_at = NOW(), is_active = $5
         WHERE user_id = $6 RETURNING *`,
        [email, full_name, password, role_id, is_active, id]
    );
    return rows[0]; // Return updated user
};

// Delete user by ID
const deleteUser = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    return rowCount > 0; // Return true if deleted, false otherwise
};

module.exports = { getAll, getById, create, update, delete: deleteUser };
