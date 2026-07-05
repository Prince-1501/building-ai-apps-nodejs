// 03_api_server.mjs

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'web-tools-server',
  version: '1.0.0',
});

// Tool: Fetch a web page
server.registerTool(
  'fetch_page',
  {
    description: 'Fetches the text content of a web page URL',
    inputSchema: { url: z.string().describe('The URL to fetch') },
  },
  async ({ url }) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const text = html.replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000);
      return {
        content: [{
          type: 'text',
          text: 'Content from ' + url + ':\n\n' + text,
        }],
      };
    } catch (e) {
      return {
        content: [{
          type: 'text',
          text: 'Error fetching URL: ' + e.message,
        }],
        isError: true,
      };
    }
  }
);

// Tool: Check if a website is reachable
server.registerTool(
  'check_status',
  {
    description: 'Checks if a website is reachable and returns its HTTP status',
    inputSchema: { url: z.string().describe('The URL to check') },
  },
  async ({ url }) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        content: [{
          type: 'text',
          text: url + ' is reachable. Status: ' + response.status,
        }],
      };
    } catch (e) {
      return {
        content: [{
          type: 'text',
          text: url + ' is not reachable: ' + e.message,
        }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Web Tools MCP Server running');
