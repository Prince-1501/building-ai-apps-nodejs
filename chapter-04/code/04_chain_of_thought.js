// chain-of-thought.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askAI(prompt) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}

async function main() {
  const question = 'I am building a chat application that needs to ' +
    'store messages, user profiles, and read receipts. Should I use ' +
    'MongoDB or PostgreSQL?';

  console.log('=== WITHOUT CHAIN OF THOUGHT ===');
  console.log(await askAI(question));

  console.log('');

  console.log('=== WITH CHAIN OF THOUGHT ===');
  console.log(await askAI(
    question + '\n\n' +
    'Think through this step by step:\n' +
    '1. First, analyze what kind of data we are storing\n' +
    '2. Then, consider the read/write patterns\n' +
    '3. Then, think about scalability needs\n' +
    '4. Finally, give a clear recommendation with reasoning'
  ));
}

main();
