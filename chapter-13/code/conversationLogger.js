// conversationLogger.js
const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, 'logs');

// Create logs directory if it does not exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Save a conversation to a JSON file
function saveConversation(sessionId, messages, status) {
  const logFile = path.join(LOGS_DIR, sessionId + '.json');

  const data = {
    sessionId: sessionId,
    status: status || 'active',
    messageCount: messages.length,
    createdAt: messages.length > 0 ? messages[0].timestamp : null,
    updatedAt: new Date().toISOString(),
    messages: messages,
  };

  fs.writeFileSync(logFile, JSON.stringify(data, null, 2), 'utf-8');
}

// Load a conversation from a JSON file
function loadConversation(sessionId) {
  const logFile = path.join(LOGS_DIR, sessionId + '.json');

  if (!fs.existsSync(logFile)) {
    return null;
  }

  const data = fs.readFileSync(logFile, 'utf-8');
  return JSON.parse(data);
}

// List all conversation logs
function listConversations() {
  const files = fs.readdirSync(LOGS_DIR).filter(
    (f) => f.endsWith('.json')
  );

  return files.map((file) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(LOGS_DIR, file), 'utf-8')
    );
    return {
      sessionId: data.sessionId,
      status: data.status,
      messageCount: data.messageCount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

module.exports = { saveConversation, loadConversation, listConversations };
