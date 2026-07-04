// 03_pinecone.js

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

async function main() {
  const index = pc.index(INDEX_NAME);

  // CREATE: Store notes with embeddings
  console.log('=== Storing notes ===');
  const notes = [
    { id: 'note1', text: 'JavaScript is a programming language for the web' },
    { id: 'note2', text: 'Node.js allows running JavaScript on the server' },
    { id: 'note3', text: 'React is a library for building user interfaces' },
    { id: 'note4', text: 'Machine learning models can classify images' },
    { id: 'note5', text: 'Vector databases store embeddings for fast search' },
  ];

  const vectors = [];
  for (const note of notes) {
    const embedding = await getEmbedding(note.text);
    vectors.push({
      id: note.id,
      values: embedding,
      metadata: { text: note.text },
    });
    console.log('Embedded:', note.id);
  }

  await index.upsert(vectors);
  console.log('All notes stored in Pinecone\n');

  // Wait for indexing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // READ: Query for similar notes
  console.log('=== Querying: "backend development" ===');
  const queryEmbedding = await getEmbedding('backend development');
  const results = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  results.matches.forEach(match => {
    console.log(
      match.score.toFixed(4) + ' | ' + match.metadata.text
    );
  });

  // UPDATE: Modify an existing note
  console.log('\n=== Updating note1 ===');
  const updatedEmbedding = await getEmbedding(
    'JavaScript is the most popular programming language in 2026'
  );
  await index.upsert([{
    id: 'note1',
    values: updatedEmbedding,
    metadata: {
      text: 'JavaScript is the most popular programming language in 2026',
    },
  }]);
  console.log('note1 updated\n');

  // DELETE: Remove a note
  console.log('=== Deleting note4 ===');
  await index.deleteOne('note4');
  console.log('note4 deleted');
}

main();
