require('dotenv').config({ path: '../.env' });
const { scheduleBatchJob, runJobNow } = require('./middleware/checkBookingStatus');
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // PostgreSQL connection
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/booking', bookingRoutes);
// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});

// Initialize and run the batch job
async function initBatchJobs() {
  try {
    // Run the job immediately when server starts
    console.log('Running initial booking status update...');
    const initialUpdates = await runJobNow();
    console.log(`Initial run updated ${initialUpdates} expired bookings`);
    
    // Schedule the job to run hourly
    scheduleBatchJob();
  } catch (error) {
    console.error('Failed to initialize batch jobs:', error);
  }
}

// Add an admin endpoint to manually trigger the job if needed
app.post('/admin/update-expired-bookings', async (req, res) => {
  try {
    const { runJobNow } = require('../src/middleware/checkBookingStatus');
    const updatedCount = await runJobNow();
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} expired bookings to inactive status`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating booking statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking statuses',
      error: error.message
    });
  }
});

// Export app for testing and the initBatchJobs function
module.exports = { app, initBatchJobs };