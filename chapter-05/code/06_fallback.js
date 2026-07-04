// 06_fallback.js

const { GoogleGenAI } = require('@google/genai');
const { Ollama } = require('ollama');
require('dotenv').config();

async function askGemini(prompt) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}

async function askOllama(prompt) {
  const ollama = new Ollama();
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.message.content;
}

async function askWithFallback(prompt) {
  const providers = [
    { name: 'Gemini', fn: askGemini },
    { name: 'Ollama', fn: askOllama },
  ];

  for (const provider of providers) {
    try {
      console.log('Trying ' + provider.name + '...');
      const result = await provider.fn(prompt);
      console.log('Success with ' + provider.name);
      return result;
    } catch (error) {
      console.log(provider.name + ' failed: ' + error.message);
    }
  }

  throw new Error('All providers failed.');
}

async function main() {
  const answer = await askWithFallback(
    'What is Node.js? Answer in one sentence.'
  );
  console.log('Answer:', answer);
}

main();
