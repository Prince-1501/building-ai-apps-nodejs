// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractText, chunkText } = require('./documentProcessor');
const { generateEmbeddings } = require('./embeddingService');
const { storeVectors } = require('./vectorStore');
const { askQuestion } = require('./ragEngine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json());

// Create uploads directory if it does not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

// Route: Upload and process a document
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);

    // Step 1: Extract text from the uploaded file
    const text = await extractText(req.file.path, req.file.originalname);
    console.log('Extracted', text.length, 'characters');

    // Step 2: Split the text into chunks
    const chunks = chunkText(text, 500, 50);
    console.log('Created', chunks.length, 'chunks');

    // Step 3: Generate embeddings for all chunks
    console.log('Generating embeddings...');
    const embeddings = await generateEmbeddings(chunks);

    // Step 4: Store vectors in Pinecone
    const documentId = req.file.filename.replace(/\.[^.]+$/, '');
    console.log('Storing vectors in Pinecone...');
    const vectorCount = await storeVectors(documentId, chunks, embeddings);

    // Clean up the uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Document processed successfully',
      fileName: req.file.originalname,
      chunks: chunks.length,
      vectors: vectorCount,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route: Ask a question about uploaded documents
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Question:', question);

    const result = await askQuestion(question);

    res.json(result);
  } catch (error) {
    console.error('Ask error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Handle multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File is too large. Maximum size is 10 MB.',
      });
    }
    return res.status(400).json({ error: error.message });
  }

  if (error.message === 'Only PDF and TXT files are allowed') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'An unexpected error occurred' });
});

// Start the server
app.listen(PORT, () => {
  console.log('AI Document Assistant running at http://localhost:' + PORT);
});
