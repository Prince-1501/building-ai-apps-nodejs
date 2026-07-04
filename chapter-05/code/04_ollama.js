// 04_ollama.js

const { Ollama } = require('ollama');
const ollama = new Ollama();

async function main() {
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: [
      { role: 'user', content: 'Explain Node.js in 2 sentences.' },
    ],
  });

  console.log(response.message.content);
}

main();