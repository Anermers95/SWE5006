require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // PostgreSQL connection
const userRoutes = require('./routes/userRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);

// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});

// Export app for testing
module.exports = app;
