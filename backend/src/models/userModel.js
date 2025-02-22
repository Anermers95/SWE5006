const pool = require('../config/db'); // PostgreSQL connection

// Get all users
const getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM t_users');
    return rows;
};

// Get user by ID
const getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM T_USERS WHERE USER_ID = $1', [id]);
    return rows[0]; // Return single user object
};

// Get user by ID
const getByEmail = async (email) => {
    const { rows } = await pool.query('SELECT * FROM T_USERS WHERE USER_EMAIL = $1', [email]);
    return rows[0]; // Return single user object
}; 

// Create a new user
const create = async ({ email, full_name, password, role_id, is_active }) => {
    console.log(email);
    const { rows } = await pool.query(
        `INSERT INTO T_USERS (USER_EMAIL, USER_FULL_NAME, USER_PASSWORD, USER_ROLE_ID, CREATED_ON, UPDATED_ON, IS_ACTIVE) 
         VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING *`,
        [email, full_name, password, role_id, is_active]
    );
    return rows[0]; // Return created user
};

// Update user by ID
const update = async (id, { email, full_name, password, role_id, is_active }) => {
    const { rows } = await pool.query(
        `UPDATE T_USERS 
         SET USER_EMAIL = $1, USER_FULL_NAME = $2, USER_PASSWORD = $3, USER_ROLE_ID = $4, UPDATED_ON = NOW(), IS_ACTIVE = $5
         WHERE USER_ID = $6 RETURNING *`,
        [email, full_name, password, role_id, is_active, id]
    );
    return rows[0]; // Return updated user
};

// Delete user by ID
const deleteUser = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM T_USERS WHERE USER_ID = $1', [id]);
    return rowCount > 0; // Return true if deleted, false otherwise
};

module.exports = { getAll, getById, create, update, deleteUser,getByEmail };
