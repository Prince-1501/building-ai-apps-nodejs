# Chapter 9: Model Context Protocol — Resources

## Official documentation
- [MCP specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP Inspector guide (official docs)](https://modelcontextprotocol.io/docs/tools/inspector)
- [Cursor MCP support](https://docs.cursor.com)

## Video resources
- [MCP tutorial — Hello World by Prince](https://www.youtube.com/@HelloWorldbyprince)
- [AI LLM Bootcamp Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwS2MrPcY22-oZxHjrpi6yEZ)
- [Complete Node.js Playlist — Hello World by Prince](https://www.youtube.com/playlist?list=PLzjZaW71kMwScTRKzoasdyB1sX-a9EbFp)

## Code files in this chapter
| File | What it demonstrates |
|------|---------------------|
| 01_first_server.mjs | Basic MCP server with calculator and date tools |
| 02_with_resources.mjs | Tools, resources, and prompts combined |
| 03_api_server.mjs | MCP server connecting to web APIs |
| 04_notes_server.mjs | Mini-project: complete notes MCP server |

## npm packages used in this chapter

| Package | What it's for |
|---------|---------------|
| [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) | The official SDK to build MCP servers and clients (tools, resources, prompts). |
| [@modelcontextprotocol/inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector) | A browser UI to test and debug your MCP server without needing a full AI client. |

## Note: Using MCP Inspector
Run the Inspector against any server file with:
```
npx @modelcontextprotocol/inspector node 04_notes_server.mjs
```
This matches the `inspect:*` npm scripts in this chapter (e.g.
`npm run inspect:first`, `npm run inspect:notes`). No installation is
needed — `npx` downloads and runs the Inspector for you.

The Inspector then opens a browser tab at a URL like:
`http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=<token>`

By default, the Inspector UI runs on port **6274** and its proxy server runs
on port **6277**. The `MCP_PROXY_AUTH_TOKEN` in the URL is a security token
generated each time you start the Inspector — it's needed so only you (not
random processes on your machine) can connect to your local server. Just
open the link the terminal prints; you don't need to set this token
yourself.

## Note
This chapter's code does not call any AI model directly, so no `.env` file
or API key is needed to run these examples. The MCP servers expose tools
that an AI client (like Claude Desktop or the MCP Inspector) can call.
