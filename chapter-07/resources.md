# Chapter 7: Retrieval-Augmented Generation — Resources

## Official documentation
- [Google AI Studio](https://aistudio.google.com)
- [Gemini API documentation](https://ai.google.dev/gemini-api/docs)
- [Pinecone documentation](https://docs.pinecone.io)

## Video resources
- [RAG tutorial — Hello World by Prince](https://www.youtube.com/@HelloWorldbyprince)
- [AI LLM Bootcamp Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwS2MrPcY22-oZxHjrpi6yEZ)
- [Complete Node.js Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwScTRKzoasdyB1sX-a9EbFp)

## Code files in this chapter
| File | What it demonstrates |
|------|---------------------|
| 01_load_documents.js | Loading text documents into memory |
| 02_chunking.js | Fixed-size and paragraph-based chunking strategies |
| 03_rag_basic.js | Complete basic RAG system from scratch |
| 04_rag_improved.js | Improved RAG with source citations |
| 05_document_qa.js | Mini-project: interactive document Q&A system |

## Troubleshooting: Common AI API Errors

While running the code in this chapter, you may see an error in your terminal.
This is normal — it usually just means the AI model needs a small change, not
that your code is broken.

| Error you see | What it means | What to do |
|---|---|---|
| `429 RESOURCE_EXHAUSTED` / "quota exceeded" | You have used up your free daily requests for that model. | Switch to a different model (see below) or wait for the quota to reset. |
| `429` with "please retry in Xs" | The model is getting too many requests too fast (rate limit). | Wait a few seconds and try again, or switch models. |
| `503 UNAVAILABLE` / "model is overloaded" | The model is in very high demand right now. | Try again in a minute, or switch to a different model. |
| `404 NOT_FOUND` / "model is not found" | The model name is old or has been retired. | Check the latest model list (link below) and update the model name in your code. |

**Note: Rate limits and model alternatives.**
If a rate limit error (429) occurs during development, switch to a different
Gemini model such as `gemini-3.5-flash` or `gemini-2.5-flash-lite`. Each model
has its own separate rate limit, so switching allows you to keep developing
without waiting. At the time of writing, these models are available on the
free tier. Newer models may be available by the time you are reading this —
visit [Gemini API models documentation](https://ai.google.dev/gemini-api/docs/models)
for the latest list of available models.
