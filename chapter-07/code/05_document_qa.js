// 05_document_qa.js

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const readline = require('readline');
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

async function indexDocument(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = chunkBySize(content, 500, 100);
  const index = pc.index(INDEX_NAME);

  console.log('Indexing ' + chunks.length + ' chunks...');

  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);
    vectors.push({
      id: 'doc-' + i,
      values: embedding,
      metadata: { text: chunks[i] },
    });
  }

  await index.upsert(vectors);
  await new Promise(r => setTimeout(r, 3000));
  console.log('Indexing complete.\n');
}

async function answerQuestion(question) {
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

  const prompt =
    'Answer the question based ONLY on the context below. ' +
    'If the answer is not in the context, say "I do not have ' +
    'enough information to answer this."\n\n' +
    'Context:\n' + context + '\n\n' +
    'Question: ' + question;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}

async function main() {
  const filePath = process.argv[2] || 'sample_document.txt';

  if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    console.log('Usage: node 05_document_qa.js <file.txt>');
    return;
  }

  console.log('=== Document Q&A System ===');
  console.log('Loading: ' + filePath + '\n');

  await indexDocument(filePath);

  console.log('Ask questions about your document.');
  console.log('Type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askLoop = () => {
    rl.question('You: ', async (question) => {
      if (question.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      const answer = await answerQuestion(question);
      console.log('AI: ' + answer + '\n');
      askLoop();
    });
  };

  askLoop();
}

main();
