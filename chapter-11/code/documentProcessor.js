// documentProcessor.js
const fs = require('fs');
const path = require('path');

// Load pdf-parse worker before importing PDFParse
require('pdf-parse/worker');
const { PDFParse } = require('pdf-parse');

// Extract text from a PDF file
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });

  try {
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  } finally {
    await parser.destroy();
  }
}

// Extract text from a plain text file
function extractTextFromTXT(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Extract text based on file type
async function extractText(filePath, originalName) {
  const extension = path.extname(originalName).toLowerCase();

  if (extension === '.pdf') {
    return await extractTextFromPDF(filePath);
  } else if (extension === '.txt') {
    return extractTextFromTXT(filePath);
  } else {
    throw new Error('Unsupported file type: ' + extension);
  }
}

// Split text into chunks with overlap
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];

  // Clean extra whitespace
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  let start = 0;

  while (start < cleanedText.length) {
    let end = start + chunkSize;

    // Do not cut in the middle of a word
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunk = cleanedText.substring(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward by chunkSize minus overlap
    start = end - overlap;

    // Prevent infinite loop on very small texts
    if (start <= chunks.length * (chunkSize - overlap) - chunkSize) {
      break;
    }
  }

  return chunks;
}

module.exports = { extractText, chunkText };
