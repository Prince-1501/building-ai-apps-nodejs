// chatEngine.js
const { GoogleGenAI } = require('@google/genai');
const { retrieveKnowledge } = require('./knowledgeBase');
const { saveConversation } = require('./conversationLogger');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENERATION_MODEL = 'gemini-2.5-flash';
const RELEVANCE_THRESHOLD = 0.55;

const SYSTEM_PROMPT =
  'You are a friendly and professional customer support assistant for '
  + 'an online store. Your role is to help customers with questions '
  + 'about returns, shipping, pricing, and account issues. Follow '
  + 'these rules:\n\n'
  + '1. Answer ONLY based on the knowledge base context provided. '
  + 'Do not make up policies, prices, or timeframes.\n'
  + '2. Be warm, empathetic, and professional in every response.\n'
  + '3. Keep responses concise and to the point.\n'
  + '4. If the context does not contain enough information to answer, '
  + 'say: "I do not have information about that in my knowledge base. '
  + 'Let me connect you with a human agent who can help."\n'
  + '5. If a customer is frustrated, acknowledge their feelings before '
  + 'providing the answer.\n'
  + '6. Format responses in a clear, readable way.';

// Escalation keywords that trigger immediate human handoff
const ESCALATION_KEYWORDS = [
  'speak to a human',
  'talk to a person',
  'human agent',
  'real person',
  'speak to someone',
  'talk to agent',
  'talk to representative',
  'connect me to',
  'escalate',
  'manager',
  'supervisor',
];

// In-memory session storage
const sessions = new Map();

// Create a new chat session
function createSession(sessionId) {
  const chat = ai.chats.create({
    model: GENERATION_MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  return {
    chat: chat,
    messages: [],
    status: 'active',
  };
}

// Check if the user message contains escalation keywords
function checkEscalation(message) {
  const lower = message.toLowerCase();
  return ESCALATION_KEYWORDS.some(
    (keyword) => lower.includes(keyword)
  );
}

// Build a message with RAG context
function buildContextMessage(question, matches) {
  if (matches.length === 0) {
    return 'Customer question: ' + question;
  }

  const context = matches
    .map(
      (match, i) =>
        'Source ' + (i + 1) + ' (from '
        + match.metadata.article + '):\n'
        + match.metadata.text
    )
    .join('\n\n');

  return (
    'Knowledge base context:\n'
    + context
    + '\n\nCustomer question: '
    + question
  );
}

// Process a customer message and return a response
async function processMessage(sessionId, userMessage) {
  // Get or create session
  let session = sessions.get(sessionId);
  if (!session) {
    session = createSession(sessionId);
    sessions.set(sessionId, session);
  }

  const timestamp = new Date().toISOString();

  // Log the user message
  session.messages.push({
    role: 'customer',
    text: userMessage,
    timestamp: timestamp,
  });

  // Check for escalation keywords
  if (checkEscalation(userMessage)) {
    const escalationResponse =
      'Of course. Let me connect you with a human support agent '
      + 'right away. A team member will be with you shortly. '
      + 'Your conversation history has been saved so you will not '
      + 'need to repeat anything.';

    session.messages.push({
      role: 'assistant',
      text: escalationResponse,
      timestamp: new Date().toISOString(),
    });

    session.status = 'escalated';
    saveConversation(sessionId, session.messages, 'escalated');

    return {
      type: 'escalation',
      message: escalationResponse,
      sources: [],
    };
  }

  // Retrieve relevant knowledge
  const matches = await retrieveKnowledge(userMessage, 3);

  // Check relevance threshold
  const hasRelevantContent =
    matches.length > 0
    && matches[0].score >= RELEVANCE_THRESHOLD;

  // Build context-enriched message
  const contextMessage = buildContextMessage(
    userMessage,
    hasRelevantContent ? matches : []
  );

  // Send to Gemini chat
  const response = await session.chat.sendMessage({
    message: contextMessage,
  });

  const assistantText = response.text;

  // Log the assistant response
  session.messages.push({
    role: 'assistant',
    text: assistantText,
    timestamp: new Date().toISOString(),
  });

  // Save the conversation log
  saveConversation(sessionId, session.messages, session.status);

  // Build source references
  const sources = hasRelevantContent
    ? matches.map((match) => ({
        article: match.metadata.article,
        score: match.score,
        preview: match.metadata.text.substring(0, 120) + '...',
      }))
    : [];

  return {
    type: 'answer',
    message: assistantText,
    sources: sources,
  };
}

// Get the full conversation history for a session
function getSessionHistory(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return session.messages;
}

module.exports = { processMessage, getSessionHistory };
