const { app, initBatchJobs } = require('./server');

const port = process.env.PORT || 3000;
const server = app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Initialize batch jobs after server has started
  await initBatchJobs();
});