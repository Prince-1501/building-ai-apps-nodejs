// 03_rag_basic.js

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INDEX_NAME = 'rag-index';

async function getEmbedding(text) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

function chunkBySize(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end).trim());
    start += chunkSize - overlap;
  }
  return chunks.filter(c => c.length > 0);
}

// INDEXING PHASE
async function indexDocument(filePath) {
  console.log('=== Indexing Phase ===\n');

  // Step 1: Load
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log('Step 1 - Loaded:', filePath);

  // Step 2: Chunk
  const chunks = chunkBySize(content, 500, 100);
  console.log('Step 2 - Created', chunks.length, 'chunks');

  // Step 3 & 4: Embed and Store
  const index = pc.index(INDEX_NAME);
  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);
    vectors.push({
      id: 'chunk-' + i,
      values: embedding,
      metadata: { text: chunks[i], source: filePath },
    });
    console.log('Step 3 - Embedded chunk', i + 1);
  }

  await index.upsert(vectors);
  console.log('Step 4 - Stored all chunks in Pinecone\n');

  // Wait for indexing
  await new Promise(r => setTimeout(r, 3000));
}

// QUERY PHASE
async function askQuestion(question) {
  console.log('Question:', question);

  // Step 5: Retrieve
  const index = pc.index(INDEX_NAME);
  const queryEmbedding = await getEmbedding(question);
  const results = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  const context = results.matches
    .map(m => m.metadata.text)
    .join('\n\n');

  console.log('Retrieved', results.matches.length, 'chunks');

  // Step 6: Generate
  const prompt =
    'Answer the following question based ONLY on the provided ' +
    'context. If the context does not contain the answer, say ' +
    '"I do not have enough information to answer this."\n\n' +
    'Context:\n' + context + '\n\n' +
    'Question: ' + question;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  console.log('\nAnswer:', response.text);
  console.log('---\n');
}

async function main() {
  // Index the document (run once)
  await indexDocument('sample_document.txt');

  // Ask questions
  console.log('=== Query Phase ===\n');
  await askQuestion('How should I handle errors in Node.js?');
  await askQuestion('What are the best practices for security?');
  await askQuestion('How can I improve performance?');
  await askQuestion('What is the recipe for chocolate cake?');
}

main();
