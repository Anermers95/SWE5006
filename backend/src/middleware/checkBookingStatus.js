// middleware/checkBookingStatus.js
const pool = require('../config/db'); // Import your PostgreSQL connection
const cron = require('node-cron');

/**
 * Updates booking status to inactive for expired bookings
 */
async function updateExpiredBookings() {
  const client = await pool.connect();
  
  try {
    console.log('Running booking status update job...');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Get current timestamp in UTC (use this format for debugging)
    // Create a date for Singapore time (adjust to your timezone)
    const now = new Date();
    now.setHours(now.getHours() + 8);
    const nowISOString = now.toISOString();
    
    console.log(`Current time for comparison: ${nowISOString}`);
    
    // Update bookings where end_time is in the past and is_active is still true
    // Make sure to handle the timestamp format correctly
    const updateQuery = `
      UPDATE t_bookings
      SET is_active = false,
          updated_on = NOW()
      WHERE end_time < $1::timestamp
      AND is_active = true
      RETURNING booking_id, start_time, end_time;
    `;
    
    const result = await client.query(updateQuery, [nowISOString]);
    
    // Log the updated bookings for debugging
    if (result.rows.length > 0) {
      console.log('Updated the following bookings to inactive:');
      result.rows.forEach(row => {
        console.log(`Booking ID: ${row.booking_id}, Time: ${row.start_time} to ${row.end_time}`);
      });
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Updated ${result.rowCount} expired bookings to inactive status`);
    return result.rowCount;
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error updating expired bookings:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}


function scheduleBatchJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await updateExpiredBookings();
    } catch (error) {
      console.error('Scheduled job failed:', error);
    }
  });
  
  console.log('Booking status update job scheduled to run every 5 minutes');
}

// Function to run the job immediately (useful for testing or initial run)
async function runJobNow() {
  try {
    const updatedCount = await updateExpiredBookings();
    return updatedCount;
  } catch (error) {
    console.error('Manual job execution failed:', error);
    throw error;
  }
}

module.exports = {
  scheduleBatchJob,
  runJobNow,
  updateExpiredBookings
};