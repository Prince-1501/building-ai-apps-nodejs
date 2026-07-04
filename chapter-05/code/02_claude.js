// 02_claude.js

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'Explain Node.js in 2 sentences.' },
    ],
  });

  console.log(response.content[0].text);
}

main();
