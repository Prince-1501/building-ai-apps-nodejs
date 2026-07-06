// ingest.js
const path = require('path');
const { ingestKnowledgeBase } = require('./knowledgeBase');

async function main() {
  console.log('Knowledge Base Ingestion');
  console.log('=======================\n');

  const knowledgeDir = path.join(__dirname, 'knowledge');

  try {
    const totalChunks = await ingestKnowledgeBase(knowledgeDir);
    console.log(
      '\nIngestion complete:', totalChunks, 'chunks stored in Pinecone'
    );
  } catch (error) {
    console.error('Ingestion failed:', error.message);
    process.exit(1);
  }
}

main();
