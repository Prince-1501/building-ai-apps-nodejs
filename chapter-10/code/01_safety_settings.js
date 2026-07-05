// 01_safety_settings.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithSafety(prompt, level) {
  console.log('Prompt:', prompt);
  console.log('Safety level:', level);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: level },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: level },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: level },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: level },
        ],
      },
    });

    if (response.text) {
      console.log('Response:', response.text.substring(0, 200));
    } else {
      console.log('Response was blocked by safety filters.');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('---');
}

async function main() {
  const safePrompt = 'Explain how encryption works.';
  const riskyPrompt = 'Write a scene where two characters argue intensely.';

  await generateWithSafety(safePrompt, 'BLOCK_LOW_AND_ABOVE');
  await generateWithSafety(riskyPrompt, 'BLOCK_LOW_AND_ABOVE');
  await generateWithSafety(riskyPrompt, 'BLOCK_MEDIUM_AND_ABOVE');
}

main();
