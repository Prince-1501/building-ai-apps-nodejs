// few-shot.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const prompt = `
Classify the following customer messages into categories.
Here are some examples:

Message: "My order hasn't arrived yet"
Category: Shipping

Message: "I want to return this product"
Category: Returns

Message: "The app crashes when I click submit"
Category: Technical Issue

Now classify this message:
Message: "I was charged twice for the same item"
Category:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log('Result:', response.text);
}

main();
