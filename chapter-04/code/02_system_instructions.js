// system-instructions.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askWithSystem(systemInstruction, userMessage) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    contents: userMessage,
  });
  return response.text;
}

async function main() {
  const question = 'What is an API?';

  console.log('=== FRIENDLY TEACHER ===');
  console.log(await askWithSystem(
    'You are a friendly coding teacher who explains concepts using ' +
    'simple analogies. Keep answers under 3 sentences.',
    question
  ));

  console.log('');

  console.log('=== STRICT INTERVIEWER ===');
  console.log(await askWithSystem(
    'You are a strict technical interviewer. Give precise, formal ' +
    'definitions only. No analogies, no examples. One sentence max.',
    question
  ));
}

main();
