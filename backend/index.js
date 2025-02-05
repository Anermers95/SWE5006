require('dotenv').config(); // Load environment variables (optional)
const pool = require('./config/db'); // PostgreSQL connection
const userRoutes = require('./routes/userRoutes');

const express = require('express');
const app = express();
const port = 3000;

// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});

app.use('/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
