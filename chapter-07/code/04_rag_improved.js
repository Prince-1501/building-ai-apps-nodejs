// 04_rag_improved.js

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

async function askWithRAG(question) {
  const index = pc.index('rag-index');
  const queryEmbedding = await getEmbedding(question);

  // Retrieve top 5 chunks instead of 3
  const results = await index.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });

  // Build context with source labels
  const context = results.matches
    .map((m, i) =>
      '[Source ' + (i + 1) + ' (score: ' +
      m.score.toFixed(3) + ')]:\n' + m.metadata.text
    ).join('\n\n');

  // Improved prompt with instructions for citations
  const prompt =
    'You are a helpful assistant that answers questions ' +
    'based ONLY on the provided context.\n\n' +
    'Rules:\n' +
    '1. Answer only from the context below.\n' +
    '2. If the answer is not in the context, say "I do not ' +
    'have enough information to answer this."\n' +
    '3. Be specific and cite which source the information ' +
    'comes from (e.g., "According to Source 2...").\n' +
    '4. Keep the answer concise, under 100 words.\n\n' +
    'Context:\n' + context + '\n\n' +
    'Question: ' + question;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log('Q: ' + question);
  console.log('A: ' + response.text);
  console.log('---\n');
}

async function main() {
  console.log('=== Improved RAG System ===\n');
  await askWithRAG('What should I do about error handling?');
  await askWithRAG('How do I secure my Node.js application?');
  await askWithRAG('How do I make my API faster?');
}

main();
