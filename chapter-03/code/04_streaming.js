// streaming.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = 'Tell me a short story about a robot learning to code.';
  console.log('Prompt:', prompt);
  console.log('');
  console.log('AI response (streaming):');

  // Use generateContentStream for streaming
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // Print each chunk as it arrives
  for await (const chunk of response) {
    process.stdout.write(chunk.text || '');
  }

  console.log('\n\nStreaming complete!');
}

main();