// 04_notes_server.mjs

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const NOTES_DIR = './notes';

if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR);
}

const server = new McpServer({
  name: 'notes-server',
  version: '1.0.0',
});

// Tool 1: Create a note
server.registerTool(
  'create_note',
  {
    description: 'Creates a new note with a title and content',
    inputSchema: {
      title: z.string().describe('Title of the note'),
      content: z.string().describe('Content of the note'),
    },
  },
  async ({ title, content }) => {
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt';
    const filepath = path.join(NOTES_DIR, filename);
    const noteContent = 'Title: ' + title + '\n'
      + 'Created: ' + new Date().toISOString() + '\n'
      + '---\n' + content;
    fs.writeFileSync(filepath, noteContent);
    return {
      content: [{ type: 'text', text: 'Note created: ' + filename }],
    };
  }
);

// Tool 2: List all notes
server.registerTool(
  'list_notes',
  { description: 'Lists all saved notes' },
  async () => {
    const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.txt'));
    if (files.length === 0) {
      return { content: [{ type: 'text', text: 'No notes found.' }] };
    }
    const list = files.map((f, i) => (i + 1) + '. ' + f).join('\n');
    return {
      content: [{ type: 'text', text: 'Notes (' + files.length + '):\n' + list }],
    };
  }
);

// Tool 3: Read a note
server.registerTool(
  'read_note',
  {
    description: 'Reads the content of a specific note',
    inputSchema: {
      filename: z.string().describe('The filename of the note'),
    },
  },
  async ({ filename }) => {
    const filepath = path.join(NOTES_DIR, filename);
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      return { content: [{ type: 'text', text: content }] };
    } catch (e) {
      return {
        content: [{ type: 'text', text: 'Note not found: ' + filename }],
        isError: true,
      };
    }
  }
);

// Tool 4: Search notes
server.registerTool(
  'search_notes',
  {
    description: 'Searches through all notes for a keyword',
    inputSchema: {
      keyword: z.string().describe('The keyword to search for'),
    },
  },
  async ({ keyword }) => {
    const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.txt'));
    const matches = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(NOTES_DIR, file), 'utf-8');
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        matches.push(file);
      }
    }
    if (matches.length === 0) {
      return {
        content: [{ type: 'text', text: 'No notes found containing: ' + keyword }],
      };
    }
    return {
      content: [{
        type: 'text',
        text: 'Found ' + matches.length + ' note(s) containing "' + keyword + '":\n' + matches.join('\n'),
      }],
    };
  }
);

// Tool 5: Delete a note
server.registerTool(
  'delete_note',
  {
    description: 'Deletes a specific note',
    inputSchema: {
      filename: z.string().describe('The filename to delete'),
    },
  },
  async ({ filename }) => {
    const filepath = path.join(NOTES_DIR, filename);
    try {
      fs.unlinkSync(filepath);
      return { content: [{ type: 'text', text: 'Deleted: ' + filename }] };
    } catch (e) {
      return {
        content: [{ type: 'text', text: 'Could not delete: ' + filename }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Notes MCP Server running');
