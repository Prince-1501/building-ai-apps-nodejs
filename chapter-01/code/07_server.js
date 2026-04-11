// server.js
// A basic Express.js server - foundation for all AI apps in this book
// Run: npm install express dotenv first

const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// This line tells Express to understand JSON data
app.use(express.json());

// Route 1: A simple welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI-Powered Node.js App!',
    status: 'Server is running'
  });
});

// Route 2: A route that echoes back what you send
app.post('/echo', (req, res) => {
  const userMessage = req.body.message;
  res.json({
    received: userMessage,
    response: `You said: ${userMessage}. In Chapter 3, this will be an AI response!`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
