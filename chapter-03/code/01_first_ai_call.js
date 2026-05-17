// first-ai-call.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function main() {
  // Step 1: Set up the Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Step 2: Send a prompt
  const prompt = 'What is Node.js? Explain in 2 sentences.';
  console.log('Sending prompt to Gemini...');

  // Step 3: Get the response
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log('Gemini says:');
  console.log(response.text);
}

main();