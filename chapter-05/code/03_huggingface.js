// 03_huggingface.js

const { InferenceClient } = require('@huggingface/inference');
require('dotenv').config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
  const response = await client.chatCompletion({
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    messages: [
      { role: 'user', content: 'Explain Node.js in 2 sentences.' },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();