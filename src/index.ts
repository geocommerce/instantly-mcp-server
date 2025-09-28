import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Server, Tool, ToolResponse } from '@modelcontextprotocol/sdk/server';

// Create an Axios instance for Instantly API v2
const instantly = axios.create({
  baseURL: process.env.INSTANTLY_API_BASE || 'https://api.instantly.ai/api/v2',
  headers: { Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}` }
});

/**
 * Tool: campaign.list
 * Lists campaigns with optional pagination.
 */
const listCampaigns: Tool = {
  name: 'campaign.list',
  description: 'List campaigns with optional pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      page: { type: 'number' },
      per_page: { type: 'number' }
    }
  },
  async execute({ input }): Promise<ToolResponse> {
    const { page = 1, per_page = 25 } = (input || {}) as any;
    const res = await instantly.get('/campaign/listcampaign', { params: { page, per_page } });
    return { content: [{ type: 'json', json: res.data }] };
  }
};

/**
 * Tool: campaign.create
 * Creates a new campaign.
 */
const createCampaign: Tool = {
  name: 'campaign.create',
  description: 'Create a new campaign (requires at least name and workspace).',
  inputSchema: {
    type: 'object',
    required: ['name', 'workspace'],
    properties: {
      name: { type: 'string' },
      workspace: { type: 'string' },
      from_name: { type: 'string' },
      daily_limit: { type: 'number' }
    }
  },
  async execute({ input }): Promise<ToolResponse> {
    const res = await instantly.post('/campaign/createcampaign', input);
    return { content: [{ type: 'json', json: res.data }] };
  }
};

/**
 * Tool: analytics.overview
 * Provides overview analytics across campaigns.
 */
const analyticsOverview: Tool = {
  name: 'analytics.overview',
  description: 'Overview analytics across campaigns (opens, replies, clicks).',
  inputSchema: {
    type: 'object',
    properties: {
      from_date: { type: 'string' },
      to_date: { type: 'string' }
    }
  },
  async execute({ input }): Promise<ToolResponse> {
    const res = await instantly.get('/analytics/overview', { params: input });
    return { content: [{ type: 'json', json: res.data }] };
  }
};

// Instantiate the MCP server
const server = new Server(
  { name: 'instantly-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);
export { server };


// Register tools with the server
server.tool(listCampaigns);
server.tool(createCampaign);
server.tool(analyticsOverview);

// Set up Express server
const app = express();
app.use(express.json());

// Handle POST requests to /sse (client -> server)
app.post('/sse', express.text({ type: '*/*' }), async (req, res) => {
  try {
    await server.handleRequest(req, res);
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});

// Handle GET requests to /sse (server -> client via SSE)
app.get('/sse', async (req, res) => {
  try {
    await server.handleSSE(req, res);
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});

// Start the Express server
const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`MCP Instantly server listening on port ${port}`);
});
