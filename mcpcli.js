import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import fs from "fs"
import fetch from "node-fetch"

const info = JSON.parse(fs.readFileSync("mcp.json", "utf-8"))
const logfile = process.cwd() + "/mcp.log";

fs.writeFileSync(logfile, JSON.stringify(info, null, 2), { encoding: 'utf8', flag: 'w+' }, (err) => {
  if (err) {
    console.error("Error writing", logfile, err);
  } else {
    console.log(logfile, "created successfully.");
  }
});

const logger = (...msg) => {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${msg.join(' ')}\n`;
  fs.appendFileSync(logfile, formattedMsg, 'utf8', { flag: 'a' });
  console.log(formattedMsg);
}

logger("Starting MCP server with info:", info);

const server = new McpServer(info.server, {
  capabilities: {
    // tools: [
    //   {
    //     id: "add",
    //     name: "Add",
    //     description: "Adds two numbers",
    //     input: { a: "number", b: "number" },
    //     output: { content: [{ type: "text", text: "string" }] },
    //   },
    // ],
  },
})

// server.resource(
//   "echo",
//   new ResourceTemplate("echo://{message}", { list: undefined }),
//   async (uri, { message }) => ({
//     contents: [{
//       uri: uri.href,
//       text: `Resource echo: ${message}`
//     }]
//   })
// );

server.tool(
  "echo",
  "Echo a message backwards",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message.split('').reverse().join('')}` }]
  })
);

// server.prompt(
//   "echo",
//   { message: z.string() },
//   async ({ message }) => {
//     return {
//       context: {
//         type: "text",
//         text: `Echo prompt context for message: ${message}`
//       },
//       messages: [
//         {
//           role: "system",
//           content: {
//             type: "text",
//             text: `Echo prompt context for message: ${message}`
//           }
//         },
//         {
//           role: "user",
//           content: {
//             type: "text",
//             text: `Please process this message: ${message}`
//           }
//         }
//       ]
//     };
//   }
// );

server.tool(
  "add",
  "Add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

server.prompt(
  "createscene",
  { id: z.string() },
  async ({ id }) => {
    try {
      logger('Fetching scene description for ID:', id);
      const response = await fetch('https://www.leitstellenspiel.de/einsaetze/' + id);
      const ok = response.ok;
      const html = await response.text();
      logger('Response status:', response.status, 'OK:', ok);
      // logger('Response headers:', JSON.stringify(response.headers.raw(), null, 2));
      // logger('Response body:', html.slice(0, 200) + '...'); // Log first 200 characters of the body

      return {
        messages: [
          {
            role: "user",
            context: {
              type: "text",
              text: fs.readFileSync(process.cwd() + '/.github/prompts/scene.prompt.md')
                + "The mission is decribed as follows:" + html,
            }
          }
        ]
      };
    } catch (e) {
      logger('Error fetching scene description:', e.message);
      return {
        messages: [
          {
            role: "user",
            context: {
              type: "text",
              text: "Error fetching scene description: " + e.message,
            }
          }
        ]
      };
    }

  }
);

server.tool(
  "scene_description",
  "Provides a scene description",
  { id: z.number() },
  async ({ id }) => {
    try {
      logger('Fetching scene description for ID:', id);
      const response = await fetch('https://www.leitstellenspiel.de/einsaetze/' + id);
      const ok = response.ok;
      const html = await response.text();
      logger('Response status:', response.status, 'OK:', ok);
      //logger('Response headers:', JSON.stringify(response.headers.raw(), null, 2));
      //logger('Response body:', html.slice(0, 200) + '...'); // Log first 200 characters of the body

      return {
        content: [{ type: "text", text: html }],
      }
    } catch (e) {
      logger('Error fetching scene description:', e.message);
      return {
        content: [{ type: "text", text: 'Error fetching scene description: ' + e.message }],
      }
    }
  }
);

try {
  const test = await fetch('https://www.leitstellenspiel.de/einsaetze/1');
  const html = await test.text();
  logger('Test fetch response status:', test.status, html.slice(0, 200) + '...');
} catch (e) {
  logger('Error while fetching test scene description:', e.message);
}

const transport = new StdioServerTransport()
await server.connect(transport)