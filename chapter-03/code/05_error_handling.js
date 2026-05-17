// error-handling.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function askAI(prompt) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('Error: Invalid API key. Check your .env file.');
    } else if (error.message.includes('429')) {
      console.error('Error: Rate limit hit. Wait a moment and try again.');
    } else if (error.message.includes('NETWORK')) {
      console.error('Error: Network issue. Check your internet connection.');
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function main() {
  const response = await askAI('What is JavaScript?');
  if (response) {
    console.log('AI:', response);
  } else {
    console.log('Failed to get a response. See error above.');
  }
}

main();