// 02_with_resources.mjs

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';

const server = new McpServer({
  name: 'notes-toolkit',
  version: '1.0.0',
});

// TOOL: Save a note
server.registerTool(
  'save_note',
  {
    description: 'Saves a note to a file',
    inputSchema: {
      filename: z.string().describe('Name of the file'),
      content: z.string().describe('Content to save'),
    },
  },
  async ({ filename, content }) => {
    fs.writeFileSync(filename, content);
    return {
      content: [{ type: 'text', text: 'Saved: ' + filename }],
    };
  }
);

// RESOURCE: Read a note file
server.registerResource(
  'note',
  new ResourceTemplate('note://{filename}', {
    list: async () => {
      const files = fs.readdirSync('.').filter(f => f.endsWith('.txt'));
      return {
        resources: files.map(f => ({
          uri: 'note://' + f,
          name: f,
        })),
      };
    },
  }),
  { mimeType: 'text/plain' },
  async (uri, { filename }) => ({
    contents: [{
      uri: uri.href,
      text: fs.readFileSync(filename, 'utf-8'),
    }],
  })
);

// PROMPT: Summarization template
server.registerPrompt(
  'summarize',
  {
    description: 'Summarizes a given text concisely',
    argsSchema: { text: z.string().describe('The text to summarize') },
  },
  ({ text }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: 'Summarize the following text in 3 bullet points:\n\n' + text,
      },
    }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Notes Toolkit MCP Server running');
