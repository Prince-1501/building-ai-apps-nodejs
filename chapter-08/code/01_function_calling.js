// 01_function_calling.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Step 1: Define available tools
const tools = [{
  functionDeclarations: [{
    name: 'calculator',
    description: 'Evaluates a math expression and returns the result',
    parameters: {
      type: 'OBJECT',
      properties: {
        expression: {
          type: 'STRING',
          description: 'The math expression, e.g. 25 * 4 + 10',
        },
      },
      required: ['expression'],
    },
  }],
}];

// The actual calculator function
function calculator(expression) {
  try {
    const result = new Function('return ' + expression)();
    return { result: result.toString() };
  } catch (error) {
    return { error: 'Invalid expression: ' + expression };
  }
}

async function main() {
  // Step 2: Send request with tools
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'What is 1847 * 29 + 583?',
    config: { tools },
  });

  // Step 3: Check if model wants to call a function
  const part = response.candidates[0].content.parts[0];

  if (part.functionCall) {
    console.log('Model wants to call:', part.functionCall.name);
    console.log('With arguments:', part.functionCall.args);

    // Execute the function
    const result = calculator(part.functionCall.args.expression);
    console.log('Function result:', result);

    // Send result back to model for final answer
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: 'What is 1847 * 29 + 583?' }] },
        { role: 'model', parts: [part] },
        { role: 'user', parts: [{ functionResponse: {
          name: 'calculator',
          response: result,
        }}] },
      ],
      config: { tools },
    });

    console.log('Final answer:', finalResponse.text);
  } else {
    console.log('Direct answer:', response.text);
  }
}

main();
