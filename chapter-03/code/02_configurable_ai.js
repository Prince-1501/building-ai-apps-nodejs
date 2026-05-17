// configurable-ai.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askAI(prompt, temperature = 0.7, maxTokens = 500) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    },
  });

  return response.text;
}

async function main() {
  // Low temperature: factual, predictable
  console.log('--- Temperature 0 (Factual) ---');
  console.log(await askAI('What is 2 + 2?', 0));

  console.log('');

  // High temperature: creative, varied
  console.log('--- Temperature 1.0 (Creative) ---');
  console.log(await askAI('Write a haiku about coding', 1.0));
}

main();