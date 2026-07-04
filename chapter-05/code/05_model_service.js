// 05_model_service.js

const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { Ollama } = require('ollama');
require('dotenv').config();

class AIService {
  constructor(provider = 'gemini') {
    this.provider = provider;
  }

  async ask(prompt) {
    switch (this.provider) {
      case 'gemini':
        return await this.askGemini(prompt);
      case 'openai':
        return await this.askOpenAI(prompt);
      case 'claude':
        return await this.askClaude(prompt);
      case 'ollama':
        return await this.askOllama(prompt);
      default:
        throw new Error('Unknown provider: ' + this.provider);
    }
  }

  async askGemini(prompt) {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  }

  async askOpenAI(prompt) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }

  async askClaude(prompt) {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0].text;
  }

  async askOllama(prompt) {
    const ollama = new Ollama();
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.message.content;
  }
}

// Test it
async function main() {
  const question = 'What is Node.js? Answer in one sentence.';

  // Switch providers by changing one word
  const gemini = new AIService('gemini');
  console.log('Gemini:', await gemini.ask(question));

  const local = new AIService('ollama');
  console.log('Ollama:', await local.ask(question));
}

main();
