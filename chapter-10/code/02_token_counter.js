// 02_token_counter.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function countAndGenerate(prompt) {
  // Count tokens BEFORE sending
  const countResponse = await ai.models.countTokens({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log('Prompt:', prompt.substring(0, 60) + '...');
  console.log('Input tokens:', countResponse.totalTokens);

  // Generate and check usage AFTER
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const usage = response.usageMetadata;
  console.log('Prompt tokens:', usage.promptTokenCount);
  console.log('Output tokens:', usage.candidatesTokenCount);
  console.log('Total tokens:', usage.totalTokenCount);

  // Calculate cost (Gemini 2.5 Flash rates)
  const inputCost = (usage.promptTokenCount / 1000000) * 0.30;
  const outputCost = (usage.candidatesTokenCount / 1000000) * 2.50;
  const totalCost = inputCost + outputCost;

  console.log('Estimated cost: $' + totalCost.toFixed(6));
  console.log('---');
}

async function main() {
  await countAndGenerate('What is Node.js?');
  await countAndGenerate(
    'Explain the complete history of JavaScript, '
    + 'including all major versions, key features '
    + 'introduced in each version, and the impact '
    + 'on web development. Be thorough and detailed.'
  );
}

main();
