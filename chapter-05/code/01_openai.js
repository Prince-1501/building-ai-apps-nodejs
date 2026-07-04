// 01_openai.js

const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Explain Node.js in 2 sentences.' },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
