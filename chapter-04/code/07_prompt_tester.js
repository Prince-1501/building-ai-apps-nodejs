// prompt-tester.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testPrompt(label, prompt, config = {}) {
  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 500,
        ...config,
      },
    });

    const timeTaken = Date.now() - startTime;
    const text = response.text;

    console.log(`\n=== ${label} ===`);
    console.log(`Temperature: ${config.temperature || 0.7}`);
    console.log(`Time: ${timeTaken}ms`);
    console.log(`Response length: ${text.length} chars`);
    console.log(`Response:\n${text}`);
    console.log('---');

    return { label, text, timeTaken };
  } catch (error) {
    console.error(`Error in ${label}:`, error.message);
    return { label, text: null, error: error.message };
  }
}

async function main() {
  console.log('Prompt Testing Tool');
  console.log('Testing multiple prompt variations...\n');

  // Test 1: Vague vs Specific
  await testPrompt(
    'Vague Prompt',
    'explain async/await'
  );

  await testPrompt(
    'Specific Prompt',
    'Explain async/await in JavaScript to a beginner. ' +
    'Use the restaurant analogy. Keep it under 100 words.'
  );

  // Test 2: Different temperatures
  await testPrompt(
    'Temperature 0 (Factual)',
    'Write a one-line description of Node.js.',
    { temperature: 0 }
  );

  await testPrompt(
    'Temperature 1 (Creative)',
    'Write a one-line description of Node.js.',
    { temperature: 1.0 }
  );

  // Test 3: With system instruction
  await testPrompt(
    'With System Instruction',
    'What is an API?',
    { systemInstruction: 'You are a pirate. Explain everything using pirate language.' }
  );

  console.log('\nAll tests complete!');
}

main();
