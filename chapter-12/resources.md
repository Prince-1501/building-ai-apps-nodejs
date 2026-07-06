# Chapter 12: Project - AI Agent with MCP — References

## Official Documentation
- Model Context Protocol Specification: https://modelcontextprotocol.io/
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP TypeScript SDK v1 API Docs: https://ts.sdk.modelcontextprotocol.io/
- Google Gemini API Function Calling: https://ai.google.dev/gemini-api/docs/function-calling
- Google GenAI SDK: https://www.npmjs.com/package/@google/genai
- Zod Schema Validation: https://zod.dev/

## npm packages used in this chapter

| Package | What it's for |
|---------|---------------|
| [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) | Builds the MCP server (tools) and the MCP client used by the agent. |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Talks to Gemini for chat and function calling. |
| [zod](https://www.npmjs.com/package/zod) | Validates the input schema for each MCP tool. |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loads the Gemini API key from the `.env` file. |

## Video resources
- [AI LLM Bootcamp Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwS2MrPcY22-oZxHjrpi6yEZ)
- [Complete Node.js Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwScTRKzoasdyB1sX-a9EbFp)

## Related Concepts
- AI Agents and Tool Integration (Chapter 8): Function calling, ReAct pattern, agent loop
- Model Context Protocol (Chapter 9): MCP architecture, hosts, clients, servers, transports, registerTool
- AI Safety, Ethics, and Cost Management (Chapter 10): Safety settings, rate limiting, cost awareness
