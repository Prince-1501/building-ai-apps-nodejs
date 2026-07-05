// 02_agent_loop.js

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const tools = [{
  functionDeclarations: [
    {
      name: 'calculator',
      description: 'Evaluates a math expression',
      parameters: {
        type: 'OBJECT',
        properties: {
          expression: { type: 'STRING', description: 'Math expression to evaluate' },
        },
        required: ['expression'],
      },
    },
    {
      name: 'get_current_date',
      description: 'Returns the current date and time',
      parameters: { type: 'OBJECT', properties: {} },
    },
    {
      name: 'read_file',
      description: 'Reads a text file and returns its contents',
      parameters: {
        type: 'OBJECT',
        properties: {
          path: { type: 'STRING', description: 'Path to the file' },
        },
        required: ['path'],
      },
    },
  ],
}];

function executeTool(name, args) {
  switch (name) {
    case 'calculator':
      try {
        const result = new Function('return ' + args.expression)();
        return { result: result.toString() };
      } catch (e) {
        return { error: 'Invalid expression' };
      }
    case 'get_current_date':
      return { date: new Date().toISOString() };
    case 'read_file':
      try {
        const content = fs.readFileSync(args.path, 'utf-8');
        return { content };
      } catch (e) {
        return { error: 'File not found: ' + args.path };
      }
    default:
      return { error: 'Unknown tool: ' + name };
  }
}

async function agentLoop(question, maxSteps) {
  console.log('Question:', question);
  console.log('---');

  let messages = [
    { role: 'user', parts: [{ text: question }] },
  ];

  for (let step = 0; step < (maxSteps || 5); step++) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: { tools },
    });

    const parts = response.candidates[0].content.parts;
    const fnCall = parts.find(p => p.functionCall);

    if (!fnCall) {
      console.log('Answer:', response.text);
      return response.text;
    }

    const toolName = fnCall.functionCall.name;
    const toolArgs = fnCall.functionCall.args;
    console.log('Step ' + (step + 1) + ': Calling',
      toolName, JSON.stringify(toolArgs));

    const result = executeTool(toolName, toolArgs);
    console.log('Result:', JSON.stringify(result));

    messages.push({ role: 'model', parts });
    messages.push({
      role: 'user',
      parts: [{ functionResponse: {
        name: toolName,
        response: result,
      }}],
    });
  }

  return 'Agent reached maximum steps.';
}

async function main() {
  fs.writeFileSync('notes.txt',
    'Meeting with client at 3pm.\nBudget: $50,000.\nDeadline: end of Q3.');

  await agentLoop('What is 2048 * 16 + 99?');
  console.log('\n');
  await agentLoop("What is today's date?");
  console.log('\n');
  await agentLoop('Read the file notes.txt and tell me the budget');
}

main();
