# Chapter 11: Project - AI Document Assistant — Resources

## Official Documentation
- Express.js Official Documentation: https://expressjs.com/
- Multer Documentation: https://github.com/expressjs/multer
- pdf-parse Documentation: https://github.com/mehmet-kozan/pdf-parse
- Google Gemini API Reference: https://ai.google.dev/gemini-api/docs
- Pinecone Documentation: https://docs.pinecone.io/
- Node.js File System API: https://nodejs.org/api/fs.html

## npm packages used in this chapter

| Package | What it's for |
|---------|---------------|
| [express](https://www.npmjs.com/package/express) | Runs the web server and handles routes like `/upload` and `/ask`. |
| [multer](https://www.npmjs.com/package/multer) | Handles file uploads from the browser (PDF/TXT documents). |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | Extracts text content from uploaded PDF files. |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Talks to Gemini to create embeddings and generate answers. |
| [@pinecone-database/pinecone](https://www.npmjs.com/package/@pinecone-database/pinecone) | Stores and searches document chunks as vectors. |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loads API keys from the `.env` file. |

## API References
- Gemini Embedding Models: https://ai.google.dev/gemini-api/docs/models
- Pinecone Upsert API: https://docs.pinecone.io/reference/api/data-plane/upsert
- Pinecone Query API: https://docs.pinecone.io/reference/api/data-plane/query

## Video resources
- [AI LLM Bootcamp Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwS2MrPcY22-oZxHjrpi6yEZ)
- [Complete Node.js Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwScTRKzoasdyB1sX-a9EbFp)

## Related Concepts
- RAG Pipeline (Chapter 7): Load, Chunk, Embed, Store, Retrieve, Generate
- Embeddings and Vector Databases (Chapter 6): gemini-embedding-2, Pinecone setup
- AI Safety and Cost Management (Chapter 10): Safety settings, rate limiting
