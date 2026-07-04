// 04_similarity_search.js

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getEmbedding(text) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

async function search(query) {
  const index = pc.index('notes-index');
  const queryEmbedding = await getEmbedding(query);

  const results = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  console.log('Query: "' + query + '"');
  console.log('Results:');
  results.matches.forEach((match, i) => {
    console.log(
      '  ' + (i + 1) + '. [' +
      match.score.toFixed(4) + '] ' +
      match.metadata.text
    );
  });
  console.log('');
}

async function main() {
  await search('how to build a website');
  await search('artificial intelligence');
  await search('storing data efficiently');
}

main();
