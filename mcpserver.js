// https://github.com/modelcontextprotocol/typescript-sdk

const express = require('express');
const fs = require('fs');
const info = JSON.parse(fs.readFileSync("mcp.json", "utf-8"))

const app = express();
const port = info.port || 3000;

app.use(express.json());

log = (req, res) => {
  console.log(new Date(), req.method, req.originalUrl);
  res.setHeader('Content-Type', 'application/json');
};

initializeMCP = (req, res) => {
  log(req, res);

  res.json({
    serverInfo: info.server,
    capabilities: {
      tools: ["/scene"]
    }
  });
};

sendTools = (req, res) => {
  log(req, res);

  res.json([
    {
      id: "scene",
      name: "Scene",
      endpoint: "/scene",
      description: "Fetches mission scene HTML by ID",
      type: "fetch",
      input: { id: "number" },
      output: { html: "string" }
    }
  ]);
};

getScene = async (id) => {
  if (!id || !/^\d+$/.test(String(id))) {
    throw new Error('Invalid or missing id parameter');
  }

  try {
    const response = await fetch('https://www.leitstellenspiel.de/einsaetze/' + id);
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching scene:', error);
    throw new Error('Internal Server Error');
  }
};

// MCP /tools endpoint
app.get('/', initializeMCP);
app.post('/', initializeMCP);
app.get('/tools', sendTools);
app.post('/tools', sendTools);
app.get('/initialize', initializeMCP);
app.post('/initialize', initializeMCP);

app.get('/scene', async (req, res) => {
  log(req, res);

  const id = req.query.id;
  try {
    const html = await getScene(id);
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP /scene endpoint (accepts JSON body)
app.post('/scene', async (req, res) => {
  log(req, res);

  const { id } = req.body;
  try {
    const html = await getScene(id);
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(function (req, res) {
  log(req, res);
  console.error('404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
});
