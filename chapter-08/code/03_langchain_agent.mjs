// 03_langchain_agent.mjs

import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import 'dotenv/config';

process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

const calculator = tool(
  ({ expression }) => {
    try {
      return String(new Function('return ' + expression)());
    } catch (e) {
      return 'Error: invalid expression';
    }
  },
  {
    name: 'calculator',
    description: 'Evaluates a math expression',
    schema: z.object({
      expression: z.string().describe('Math expression to evaluate'),
    }),
  }
);

const agent = createAgent({
  model: 'google-genai:gemini-2.5-flash',
  tools: [calculator],
});

const result = await agent.invoke({
  messages: [
    { role: 'user', content: 'What is 1847 * 29 + 583?' },
  ],
});

console.log('Answer:', result.messages.at(-1).content);
