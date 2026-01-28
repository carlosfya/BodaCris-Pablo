const express = require('express');
const path = require('path');
const submitHandler = require('./api/submit');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// API Route
app.all('/api/submit', async (req, res) => {
  try {
    await submitHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
