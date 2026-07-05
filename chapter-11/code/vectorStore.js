// vectorStore.js
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const INDEX_NAME = 'doc-assistant-index';

// Get the Pinecone index
function getIndex() {
  return pc.index(INDEX_NAME);
}

// Store document chunks as vectors in Pinecone
async function storeVectors(documentId, chunks, embeddings) {
  const index = getIndex();

  const vectors = chunks.map((chunk, i) => ({
    id: documentId + '-chunk-' + i,
    values: embeddings[i],
    metadata: {
      text: chunk,
      documentId: documentId,
      chunkIndex: i,
    },
  }));

  // Upsert in batches of 100 (Pinecone recommendation)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }

  return vectors.length;
}

// Query Pinecone for similar chunks
async function querySimilar(queryEmbedding, topK = 3) {
  const index = getIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true,
  });

  return result.matches;
}

// Delete all vectors for a specific document
async function deleteDocument(documentId) {
  const index = getIndex();

  // Pinecone does not support metadata-based deletion on free tier
  // This is a simplified approach using known chunk IDs
  // In production, track chunk IDs in a database
  const idsToDelete = [];
  for (let i = 0; i < 1000; i++) {
    idsToDelete.push(documentId + '-chunk-' + i);
  }

  // Delete in batches
  const batchSize = 100;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    try {
      await index.deleteMany(batch);
    } catch (error) {
      // Stop when no more chunks exist
      break;
    }
  }
}

module.exports = { storeVectors, querySimilar, deleteDocument };
