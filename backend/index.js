require('dotenv').config(); // Load environment variables (optional)
const cors = require('cors');
const pool = require('./config/db'); // PostgreSQL connection
const userRoutes = require('./routes/userRoutes');


const express = require('express');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);


// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
