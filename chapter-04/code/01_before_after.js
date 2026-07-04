// before-after.js

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
  // Bad prompt: vague, no context, no format
  console.log('=== BAD PROMPT ===');
  console.log(await askAI('tell me about javascript'));

  console.log('');

  // Good prompt: specific, contextual, formatted
  console.log('=== GOOD PROMPT ===');
  console.log(await askAI(
    'Explain JavaScript to a beginner in exactly 3 bullet points. ' +
    'Each point should be one sentence. ' +
    'Focus on what makes JavaScript different from other languages.'
  ));
}

main();
