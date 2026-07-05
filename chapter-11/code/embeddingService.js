// embeddingService.js
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBEDDING_MODEL = 'gemini-embedding-2';

// Generate an embedding for a single text
async function generateEmbedding(text) {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: 768 },
  });

  return result.embeddings[0].values;
}

// Generate embeddings for multiple texts
async function generateEmbeddings(texts) {
  const embeddings = [];

  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push(embedding);

    // Respect Gemini free tier rate limits (20 RPM)
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return embeddings;
}

module.exports = { generateEmbedding, generateEmbeddings };
