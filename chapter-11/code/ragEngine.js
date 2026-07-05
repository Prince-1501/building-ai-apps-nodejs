// ragEngine.js
const { GoogleGenAI } = require('@google/genai');
const { generateEmbedding } = require('./embeddingService');
const { querySimilar } = require('./vectorStore');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENERATION_MODEL = 'gemini-2.5-flash';

// Ask a question about the uploaded documents
async function askQuestion(question) {
  // Step 1: Generate embedding for the question
  const queryEmbedding = await generateEmbedding(question);

  // Step 2: Retrieve the most relevant chunks from Pinecone
  const matches = await querySimilar(queryEmbedding, 3);

  if (matches.length === 0) {
    return {
      answer: 'No relevant information was found in the uploaded documents. '
        + 'Please upload a document first and try again.',
      sources: [],
    };
  }

  // Step 3: Build context from retrieved chunks
  const context = matches
    .map((match, i) => 'Source ' + (i + 1) + ':\n' + match.metadata.text)
    .join('\n\n');

  // Step 4: Generate answer using Gemini with the retrieved context
  const prompt = 'You are a helpful document assistant. Answer the user\'s '
    + 'question based ONLY on the following context extracted from their '
    + 'uploaded documents. If the context does not contain enough information '
    + 'to answer the question, say so honestly. Do not make up information.\n\n'
    + 'Context:\n' + context + '\n\n'
    + 'Question: ' + question + '\n\n'
    + 'Answer:';

  const response = await ai.models.generateContent({
    model: GENERATION_MODEL,
    contents: prompt,
  });

  const answer = response.text;

  // Step 5: Format source references
  const sources = matches.map((match, i) => ({
    chunkIndex: match.metadata.chunkIndex,
    score: match.score,
    preview: match.metadata.text.substring(0, 150) + '...',
  }));

  return { answer, sources };
}

module.exports = { askQuestion };
