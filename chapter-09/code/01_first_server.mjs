// 01_first_server.mjs

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-first-server',
  version: '1.0.0',
});

// Tool 1: Calculator
server.registerTool(
  'calculator',
  {
    description: 'Evaluates a math expression and returns the result',
    inputSchema: {
      expression: z.string().describe('Math expression, e.g. 25 * 4'),
    },
  },
  async ({ expression }) => {
    try {
      const result = new Function('return ' + expression)();
      return {
        content: [{ type: 'text', text: String(result) }],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: 'Error: invalid expression' }],
        isError: true,
      };
    }
  }
);

// Tool 2: Current date and time
server.registerTool(
  'get_date',
  { description: 'Returns the current date and time' },
  async () => ({
    content: [{
      type: 'text',
      text: new Date().toISOString(),
    }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('MCP Server running on stdio');
