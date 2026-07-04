// 07_smart_router.js

const { GoogleGenAI } = require('@google/genai');
const { Ollama } = require('ollama');
require('dotenv').config();

// Route tasks to the best model
function chooseProvider(taskType) {
  const localTasks = ['private', 'offline', 'journal', 'medical'];
  const cloudTasks = ['general', 'creative', 'analysis', 'translate'];

  if (localTasks.includes(taskType)) {
    return 'ollama';
  }
  return 'gemini';
}

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

async function smartAsk(taskType, prompt) {
  const provider = chooseProvider(taskType);
  console.log('[Router] Task: ' + taskType +
    ' -> Provider: ' + provider);

  try {
    let result;
    if (provider === 'gemini') {
      result = await askGemini(prompt);
    } else {
      result = await askOllama(prompt);
    }
    console.log('[Router] Success with ' + provider);
    return result;
  } catch (error) {
    console.log('[Router] ' + provider +
      ' failed, trying fallback...');
    // Fallback: if cloud fails, try local; if local fails, try cloud
    try {
      let fallbackResult;
      if (provider === 'gemini') {
        fallbackResult = await askOllama(prompt);
        console.log('[Router] Fallback to Ollama succeeded');
      } else {
        fallbackResult = await askGemini(prompt);
        console.log('[Router] Fallback to Gemini succeeded');
      }
      return fallbackResult;
    } catch (fallbackError) {
      throw new Error('Both providers failed.');
    }
  }
}

// Test with different task types
async function main() {
  console.log('=== Intelligent Model Switcher ===\n');

  // General question -> routes to Gemini (cloud)
  console.log('--- General Question ---');
  const answer1 = await smartAsk('general',
    'What are the top 3 features of Node.js?');
  console.log(answer1 + '\n');

  // Private data -> routes to Ollama (local)
  console.log('--- Private Data ---');
  const answer2 = await smartAsk('private',
    'Summarize this note: Meeting with client about ' +
    'Q3 revenue projections and budget concerns.');
  console.log(answer2 + '\n');

  // Creative task -> routes to Gemini (cloud)
  console.log('--- Creative Task ---');
  const answer3 = await smartAsk('creative',
    'Write a haiku about JavaScript.');
  console.log(answer3 + '\n');

  console.log('=== All tasks complete ===');
}

main();
