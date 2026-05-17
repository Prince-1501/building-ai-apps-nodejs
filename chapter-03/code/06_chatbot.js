// chatbot.js

const { GoogleGenAI } = require('@google/genai');
const readline = require('readline');
require('dotenv').config();

// Set up the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Start a chat session with history
const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
  history: [],
});

// Set up terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('AI Chatbot is ready! Type your message and press Enter.');
console.log('Type "exit" to quit.');
console.log('---');

function askQuestion() {
  rl.question('You: ', async (userMessage) => {
    // Check if user wants to exit
    if (userMessage.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    // Pause input while AI is responding
    rl.pause();

    try {
      // Send message and stream the response
      process.stdout.write('AI: ');
      const response = await chat.sendMessageStream({ message: userMessage });

      for await (const chunk of response) {
        process.stdout.write(chunk.text || '');
      }

      console.log('\n');
    } catch (error) {
      console.error('\nError:', error.message);
      console.log('');
    }

    // Resume input after AI finishes
    rl.resume();

    // Ask for the next question
    askQuestion();
  });
}

// Start the conversation
askQuestion();