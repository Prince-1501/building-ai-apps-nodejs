// 05_semantic_search.js

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INDEX_NAME = 'notes-index';

async function getEmbedding(text) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

async function addNote(index, id, text, category) {
  const embedding = await getEmbedding(text);
  await index.upsert([{
    id: id,
    values: embedding,
    metadata: { text: text, category: category },
  }]);
  console.log('[Added] ' + category + ': ' + text);
}

async function searchNotes(index, query, topK) {
  const queryEmbedding = await getEmbedding(query);
  const results = await index.query({
    vector: queryEmbedding,
    topK: topK || 3,
    includeMetadata: true,
  });
  return results.matches;
}

async function main() {
  const index = pc.index(INDEX_NAME);

  // Step 1: Add notes across different topics
  console.log('=== Adding Notes ===\n');

  await addNote(index, 'n1',
    'JavaScript closures capture variables from the outer scope',
    'programming');
  await addNote(index, 'n2',
    'React useEffect runs after every render by default',
    'programming');
  await addNote(index, 'n3',
    'Drink at least 8 glasses of water daily for good health',
    'health');
  await addNote(index, 'n4',
    'Compound interest grows your savings exponentially over time',
    'finance');
  await addNote(index, 'n5',
    'Regular exercise improves both physical and mental health',
    'health');
  await addNote(index, 'n6',
    'Node.js event loop handles async operations efficiently',
    'programming');
  await addNote(index, 'n7',
    'Diversify investments across stocks, bonds, and real estate',
    'finance');
  await addNote(index, 'n8',
    'MongoDB stores data in flexible JSON-like documents',
    'programming');

  // Wait for indexing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 2: Search with natural language
  console.log('\n=== Semantic Search ===\n');

  const queries = [
    'How does async work in JavaScript?',
    'Tips for staying healthy',
    'How to grow my money',
    'database for storing JSON data',
  ];

  for (const query of queries) {
    console.log('Search: "' + query + '"');
    const results = await searchNotes(index, query, 3);
    results.forEach((match, i) => {
      console.log(
        '  ' + (i + 1) + '. [' +
        match.score.toFixed(4) + '] ' +
        '[' + match.metadata.category + '] ' +
        match.metadata.text
      );
    });
    console.log('');
  }
}

main();
