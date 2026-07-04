// 02_chunking.js

const fs = require('fs');

// Strategy 1: Fixed-size chunks with overlap
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

// Strategy 2: Paragraph-based chunks
function chunkByParagraph(text) {
  return text.split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 50);
}

// Load document
const content = fs.readFileSync('sample_document.txt', 'utf-8');

// Compare strategies
console.log('=== Fixed-size chunks (500 chars, 100 overlap) ===');
const fixedChunks = chunkBySize(content, 500, 100);
fixedChunks.forEach((chunk, i) => {
  console.log('Chunk ' + (i + 1) + ' (' + chunk.length +
    ' chars): ' + chunk.substring(0, 60) + '...');
});

console.log('\n=== Paragraph-based chunks ===');
const paraChunks = chunkByParagraph(content);
paraChunks.forEach((chunk, i) => {
  console.log('Chunk ' + (i + 1) + ' (' + chunk.length +
    ' chars): ' + chunk.substring(0, 60) + '...');
});
