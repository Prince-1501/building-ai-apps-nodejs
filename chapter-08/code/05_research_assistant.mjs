// 05_research_assistant.mjs

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
    description: 'Reads a local text file and returns its content',
    schema: z.object({
      path: z.string().describe('Path to the text file'),
    }),
  }
);

const fetchUrl = tool(
  async ({ url }) => {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      return text.substring(0, 3000);
    } catch (e) {
      return 'Error: could not fetch ' + url;
    }
  },
  {
    name: 'fetch_url',
    description: 'Fetches the text content of a web page',
    schema: z.object({
      url: z.string().describe('The URL to fetch'),
    }),
  }
);

const agent = createAgent({
  model: 'google-genai:gemini-2.5-flash',
  tools: [calculator, getDate, readFile, fetchUrl],
  systemPrompt:
    'You are an AI research assistant. You MUST use your available tools ' +
    'to answer questions. Use read_file to read files, calculator to do math, ' +
    'get_date for dates, and fetch_url for web pages. ' +
    'Never ask the user for permission. Just use the tools and answer.',
});

async function research(question) {
  console.log('=== Research Question ===');
  console.log(question);
  console.log('');

  const result = await agent.invoke({
    messages: [{ role: 'user', content: question }],
  });

  console.log('=== Research Answer ===');
  console.log(result.messages.at(-1).content);
  console.log('\n---\n');
}

await research(
  'Read the file research_data.txt and calculate what percentage ' +
  "of Node.js developers use Express.js. Also tell me today's date."
);

await research(
  'Read research_data.txt and calculate the total percentage of ' +
  'the top 3 industries using Node.js.'
);
