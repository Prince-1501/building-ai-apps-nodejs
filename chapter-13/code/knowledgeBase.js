// knowledgeBase.js
const { GoogleGenAI } = require('@google/genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const EMBEDDING_MODEL = 'gemini-embedding-2';
const INDEX_NAME = 'support-chatbot-index';

function getIndex() {
  return pc.index(INDEX_NAME);
}

// Generate an embedding for a single text
async function generateEmbedding(text) {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

// Split text into chunks with overlap
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const cleaned = text.replace(/\s+/g, ' ').trim();
  let start = 0;

  while (start < cleaned.length) {
    let end = start + chunkSize;
    if (end < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }
    const chunk = cleaned.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    start = end - overlap;
    if (start >= cleaned.length) break;
  }

  return chunks;
}

// Ingest all knowledge base articles into Pinecone
async function ingestKnowledgeBase(knowledgeDir) {
  const files = fs.readdirSync(knowledgeDir).filter(
    (f) => f.endsWith('.txt')
  );

  console.log('Found', files.length, 'knowledge base articles');

  let totalChunks = 0;
  const index = getIndex();

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const text = fs.readFileSync(filePath, 'utf-8');
    const articleName = file.replace('.txt', '');

    console.log('Processing:', file);

    // Chunk the article
    const chunks = chunkText(text, 500, 50);
    console.log('  Created', chunks.length, 'chunks');

    // Generate embeddings for all chunks
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      vectors.push({
        id: articleName + '-chunk-' + i,
        values: embedding,
        metadata: {
          text: chunks[i],
          article: articleName,
          chunkIndex: i,
        },
      });

      // Rate limit delay
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Upsert to Pinecone
    await index.upsert(vectors);
    totalChunks += vectors.length;
    console.log('  Stored', vectors.length, 'vectors');
  }

  return totalChunks;
}

// Retrieve relevant knowledge for a question
async function retrieveKnowledge(question, topK = 3) {
  const queryEmbedding = await generateEmbedding(question);
  const index = getIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true,
  });

  return result.matches;
}

module.exports = {
  ingestKnowledgeBase,
  retrieveKnowledge,
};
