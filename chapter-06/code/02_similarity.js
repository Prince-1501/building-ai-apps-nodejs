// 02_similarity.js

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

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Manual in-memory vector store
class MiniVectorStore {
  constructor() {
    this.vectors = [];
  }

  add(id, text, embedding) {
    this.vectors.push({ id, text, embedding });
  }

  search(queryEmbedding, topK = 3) {
    const results = this.vectors.map(item => ({
      id: item.id,
      text: item.text,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }));
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

async function main() {
  const texts = [
    'The cat sat on the mat',
    'A kitten was sitting on the rug',
    'The stock market crashed yesterday',
    'My dog loves playing in the park',
    'Financial markets are volatile today',
  ];

  // Generate embeddings and add to store
  const store = new MiniVectorStore();
  for (let i = 0; i < texts.length; i++) {
    const embedding = await getEmbedding(texts[i]);
    store.add('doc' + i, texts[i], embedding);
    console.log('Added:', texts[i]);
  }

  // Search for similar texts
  console.log('\n=== Searching: "cute cat" ===');
  const query1 = await getEmbedding('cute cat');
  const results1 = store.search(query1, 3);
  results1.forEach(r =>
    console.log(r.score.toFixed(4) + ' | ' + r.text));

  console.log('\n=== Searching: "economy news" ===');
  const query2 = await getEmbedding('economy news');
  const results2 = store.search(query2, 3);
  results2.forEach(r =>
    console.log(r.score.toFixed(4) + ' | ' + r.text));
}

main();
