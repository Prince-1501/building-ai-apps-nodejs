// 01_embeddings.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getEmbedding(text) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

async function main() {
  const texts = [
    'The cat sat on the mat',
    'A kitten was sitting on the rug',
    'The stock market crashed yesterday',
  ];

  for (const text of texts) {
    const embedding = await getEmbedding(text);
    console.log('Text:', text);
    console.log('Dimensions:', embedding.length);
    console.log('First 5 values:', embedding.slice(0, 5));
    console.log('---');
  }
}

main();
