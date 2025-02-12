const { Pool } = require('pg');
require('dotenv').config();


console.log("🔍 Loaded DB Config:", {
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DB_PORT || 5432,
    // ssl:{
    //     rejectUnauthorized: false,
    // }
});


pool.connect()
    .then(() => {console.log('✅ Connected to PostgreSQL');
    })
    .catch((err) => console.error('❌ Database connection error:', err.message));

module.exports = pool;