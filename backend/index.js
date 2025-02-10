require('dotenv').config(); // Load environment variables (optional)
const pool = require('./config/db'); // PostgreSQL connection
const userRoutes = require('./routes/userRoutes');
console.log(process.env);
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;
app.use('/users', userRoutes);

// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
