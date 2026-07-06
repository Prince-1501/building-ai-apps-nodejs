// server.js
const express = require('express');
const path = require('path');
const { processMessage } = require('./chatEngine');
const { listConversations, loadConversation } = require('./conversationLogger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json());

// Route: Chat with the support bot
app.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Session ID and message are required',
      });
    }

    console.log('Session:', sessionId, '| Message:', message);

    const result = await processMessage(sessionId, message);

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route: List all conversation logs (admin)
app.get('/conversations', (req, res) => {
  try {
    const conversations = listConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: Get a specific conversation log (admin)
app.get('/conversations/:sessionId', (req, res) => {
  try {
    const conversation = loadConversation(req.params.sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// Start the server
app.listen(PORT, () => {
  console.log(
    'AI Support Chatbot running at http://localhost:' + PORT
  );
  console.log(
    'Run "node ingest.js" first to load the knowledge base'
  );
});
