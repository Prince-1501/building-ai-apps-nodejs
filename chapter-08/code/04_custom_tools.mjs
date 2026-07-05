// 04_custom_tools.mjs

import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import fs from 'fs';
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
      expression: z.string().describe('The math expression'),
    }),
  }
);

const getDate = tool(
  () => new Date().toISOString(),
  {
    name: 'get_date',
    description: 'Returns the current date and time',
    schema: z.object({}),
  }
);

const readFile = tool(
  ({ path }) => {
    try {
      return fs.readFileSync(path, 'utf-8');
    } catch (e) {
      return 'Error: file not found at ' + path;
    }
  },
  {
    name: 'read_file',
    description: 'Reads a local text file',
    schema: z.object({
      path: z.string().describe('Path to the text file'),
    }),
  }
);

const fetchUrl = tool(
  async ({ url }) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text.substring(0, 2000);
    } catch (e) {
      return 'Error: could not fetch ' + url;
    }
  },
  {
    name: 'fetch_url',
    description: 'Fetches content from a URL',
    schema: z.object({
      url: z.string().describe('The URL to fetch'),
    }),
  }
);

const agent = createAgent({
  model: 'google-genai:gemini-2.5-flash',
  tools: [calculator, getDate, readFile, fetchUrl],
  systemPrompt: 'You are a helpful assistant with access to tools. '
    + 'Use the available tools when needed to answer questions.',
});

async function ask(question) {
  console.log('Q:', question);
  const result = await agent.invoke({
    messages: [{ role: 'user', content: question }],
  });
  console.log('A:', result.messages.at(-1).content);
  console.log('---');
}

await ask('What is 15% of 8500?');
await ask("What is today's date and day of the week?");
await ask('Read the file notes.txt and summarize it');
