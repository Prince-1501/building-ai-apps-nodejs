// structured-output.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const prompt = `
Analyze the following code review request and respond ONLY in JSON format.
Do not include any text before or after the JSON.

Code:
function add(a, b) {
  return a - b;
}

Respond with this exact JSON structure:
{
  "hasBug": true/false,
  "bugDescription": "description of the bug or null",
  "suggestion": "how to fix it or null",
  "severity": "low/medium/high"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0,
    },
  });

  const text = response.text;

  // Clean and parse JSON
  const cleaned = text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);

  console.log('Has bug:', result.hasBug);
  console.log('Description:', result.bugDescription);
  console.log('Suggestion:', result.suggestion);
  console.log('Severity:', result.severity);
}

main();
