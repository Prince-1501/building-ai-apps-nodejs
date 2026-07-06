// agent.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATION_MODEL = 'gemini-2.5-flash';

// ── Step 1: Connect the MCP client to the MCP server ──────────────

async function connectToMcpServer() {
  const client = new Client({
    name: 'ai-agent',
    version: '1.0.0',
  });

  // Spawn the MCP server as a child process via stdio transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: [path.join(__dirname, 'mcp-server.mjs')],
  });

  await client.connect(transport);
  console.log('Connected to MCP server');

  return client;
}

// ── Step 2: Convert MCP tools to Gemini function declarations ─────

async function getGeminiTools(mcpClient) {
  // List all tools from the MCP server
  const { tools } = await mcpClient.listTools();

  console.log('Discovered', tools.length, 'tools:');
  tools.forEach((tool) => {
    console.log('  -', tool.name + ':', tool.description);
  });

  // Convert MCP tool definitions to Gemini function declarations
  // MCP inputSchema is JSON Schema format, which maps directly
  // to Gemini's parametersJsonSchema
  const functionDeclarations = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: tool.inputSchema,
  }));

  return functionDeclarations;
}

// ── Step 3: Execute a tool call through the MCP client ────────────

async function executeTool(mcpClient, toolName, toolArgs) {
  console.log('  Calling tool:', toolName, JSON.stringify(toolArgs));

  const result = await mcpClient.callTool({
    name: toolName,
    arguments: toolArgs,
  });

  // Extract text from the MCP tool result
  const output = result.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n');

  console.log('  Tool result:', output.substring(0, 100)
    + (output.length > 100 ? '...' : ''));

  return output;
}

// ── Step 4: Run the agent loop ────────────────────────────────────

async function agentLoop(chat, mcpClient, userMessage) {
  // Send the user message to Gemini
  let response = await chat.sendMessage({ message: userMessage });

  // Agent loop: keep processing until Gemini returns a text response
  while (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];

    // Execute the tool through the MCP client
    const toolOutput = await executeTool(
      mcpClient, call.name, call.args
    );

    // Send the tool result back to Gemini as a function response
    response = await chat.sendMessage({
      message: {
        functionResponse: {
          name: call.name,
          response: { output: toolOutput },
        },
      },
    });
  }

  // Return the final text response
  return response.text;
}

// ── Step 5: Main function ─────────────────────────────────────────

async function main() {
  console.log('AI Agent with MCP');
  console.log('=================\n');

  // Connect to the MCP server
  const mcpClient = await connectToMcpServer();

  // Discover tools and convert to Gemini format
  const functionDeclarations = await getGeminiTools(mcpClient);

  // Initialize the Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Create a chat session with tools and system instruction
  const chat = ai.chats.create({
    model: GENERATION_MODEL,
    config: {
      systemInstruction:
        'You are a helpful AI assistant with access to tools. '
        + 'Use the available tools when you need to read files, '
        + 'write files, list files, perform calculations, or check '
        + 'the current date and time. Always explain what you are '
        + 'doing when you use a tool. Be concise and helpful.',
      tools: [{ functionDeclarations: functionDeclarations }],
    },
  });

  console.log('\nAgent ready. Type your message or "exit" to quit.\n');

  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (userInput.length === 0) {
        askQuestion();
        return;
      }

      try {
        const answer = await agentLoop(chat, mcpClient, userInput);
        console.log('\nAssistant:', answer, '\n');
      } catch (error) {
        console.error('\nError:', error.message, '\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
