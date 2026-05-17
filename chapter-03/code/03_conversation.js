// conversation.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Start a chat session (this remembers history)
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: [],
  });

  // Message 1
  console.log('User: My name is Prince');
  let response = await chat.sendMessage({ message: 'My name is Prince' });
  console.log('AI:', response.text);
  console.log('');

  // Message 2 - AI should remember the name
  console.log('User: What is my name?');
  response = await chat.sendMessage({ message: 'What is my name?' });
  console.log('AI:', response.text);
}

main();