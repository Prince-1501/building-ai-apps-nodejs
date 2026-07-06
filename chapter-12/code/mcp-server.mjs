// mcp-server.mjs
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this file (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The workspace directory where the agent can read and write files
const WORKSPACE_DIR = path.join(__dirname, 'workspace');

// Create workspace directory if it does not exist
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Use console.error for debug messages — stdout is the MCP protocol channel
console.error('MCP Server starting...');
console.error('Workspace directory:', WORKSPACE_DIR);

// Create the MCP server
const server = new McpServer({
  name: 'ai-agent-tools',
  version: '1.0.0',
});

// Tool 1: Read a file from the workspace
server.registerTool(
  'read_file',
  {
    title: 'Read File',
    description:
      'Read the contents of a file from the workspace directory. '
      + 'Returns the text content of the file.',
    inputSchema: {
      filename: z.string().describe(
        'The name of the file to read, for example sample.txt'
      ),
    },
  },
  async ({ filename }) => {
    const filePath = path.join(WORKSPACE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return {
        content: [
          { type: 'text', text: 'Error: File not found: ' + filename },
        ],
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    console.error('Read file:', filename, '(' + content.length + ' chars)');

    return {
      content: [{ type: 'text', text: content }],
    };
  }
);

// Tool 2: Write content to a file in the workspace
server.registerTool(
  'write_file',
  {
    title: 'Write File',
    description:
      'Write content to a file in the workspace directory. '
      + 'Creates the file if it does not exist, or overwrites it if it does.',
    inputSchema: {
      filename: z.string().describe(
        'The name of the file to write, for example notes.txt'
      ),
      content: z.string().describe('The text content to write to the file'),
    },
  },
  async ({ filename, content }) => {
    const filePath = path.join(WORKSPACE_DIR, filename);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.error('Wrote file:', filename, '(' + content.length + ' chars)');

    return {
      content: [
        {
          type: 'text',
          text: 'Successfully wrote ' + content.length
            + ' characters to ' + filename,
        },
      ],
    };
  }
);

// Tool 3: List files in the workspace directory
server.registerTool(
  'list_files',
  {
    title: 'List Files',
    description:
      'List all files in the workspace directory. '
      + 'Returns the file names and their sizes.',
    inputSchema: {},
  },
  async () => {
    const files = fs.readdirSync(WORKSPACE_DIR);

    if (files.length === 0) {
      return {
        content: [
          { type: 'text', text: 'The workspace directory is empty.' },
        ],
      };
    }

    const fileList = files.map((file) => {
      const filePath = path.join(WORKSPACE_DIR, file);
      const stats = fs.statSync(filePath);
      return file + ' (' + stats.size + ' bytes)';
    });

    console.error('Listed', files.length, 'files');

    return {
      content: [{ type: 'text', text: fileList.join('\n') }],
    };
  }
);

// Tool 4: Calculate a math expression
server.registerTool(
  'calculate',
  {
    title: 'Calculator',
    description:
      'Evaluate a mathematical expression and return the result. '
      + 'Supports addition, subtraction, multiplication, division, '
      + 'and parentheses. Example: (10 + 5) * 3',
    inputSchema: {
      expression: z.string().describe(
        'The math expression to evaluate, for example (10 + 5) * 3'
      ),
    },
  },
  async ({ expression }) => {
    // Only allow safe characters: digits, operators, parentheses, spaces, dots
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Invalid characters in expression. '
              + 'Only numbers and operators (+, -, *, /, parentheses) '
              + 'are allowed.',
          },
        ],
      };
    }

    try {
      const result = new Function('return ' + expression)();
      console.error('Calculated:', expression, '=', result);

      return {
        content: [
          { type: 'text', text: expression + ' = ' + String(result) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Could not evaluate expression: '
              + error.message,
          },
        ],
      };
    }
  }
);

// Tool 5: Get the current date and time
server.registerTool(
  'get_datetime',
  {
    title: 'Get Date and Time',
    description:
      'Get the current date, time, day of the week, '
      + 'and timezone information.',
    inputSchema: {},
  },
  async () => {
    const now = new Date();
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday',
    ];

    const info = {
      date: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      day: days[now.getDay()],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: now.toISOString(),
    };

    console.error('Returned datetime:', info.date, info.time);

    return {
      content: [
        {
          type: 'text',
          text: 'Date: ' + info.date + '\n'
            + 'Time: ' + info.time + '\n'
            + 'Day: ' + info.day + '\n'
            + 'Timezone: ' + info.timezone + '\n'
            + 'ISO: ' + info.timestamp,
        },
      ],
    };
  }
);

// Connect the server to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('MCP Server running with 5 tools');
