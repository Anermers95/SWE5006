const express = require('express');
const app = express();
const port = 3000;

// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
