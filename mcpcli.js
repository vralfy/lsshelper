import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import fs from "fs"
const info = JSON.parse(fs.readFileSync("mcp.json", "utf-8"))

const server = new McpServer(info.server, {
  capabilities: {
    tools: [
      {
        id: "add",
        name: "Add",
        description: "Adds two numbers",
        input: { a: "number", b: "number" },
        output: { content: [{ type: "text", text: "string" }] },
      },
    ],
  },
})

server.tool(
  "add",
  "Add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

const transport = new StdioServerTransport()
await server.connect(transport)