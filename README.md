# Instantly MCP Server

This project provides a Model Context Protocol (MCP) server that connects ChatGPT to the Instantly.ai API. Once deployed, the server exposes an `/sse` endpoint that ChatGPT Connectors can use to list campaigns, create campaigns, and fetch overview analytics from Instantly.

## Prerequisites

- **Node.js** (version 18 or newer).
- An **Instantly.ai API v2 key**, available from your Instantly dashboard.
- A `.env` file based on `.env.example` to configure the API key, base URL, and port.

## Installation

Clone this repository and install dependencies:

```bash
npm install
```

## Usage

For development, start the server with hot reload using `ts-node`:

```bash
npm run dev
```

To compile the TypeScript and run the compiled JavaScript:

```bash
npm run build
npm start
```

By default, the server listens on port `8080` (overridable via the `PORT` environment variable). It exposes the `/sse` route for both **GET** (to establish an SSE stream) and **POST** (to send messages from the client). This transport conforms to the MCP specification for Streamable HTTP, allowing ChatGPT to call the exposed tools.

### Exposed Tools

This implementation provides three example tools:

| Tool Name        | Description                                                                 | Input Schema                                    |
|------------------|-----------------------------------------------------------------------------|-------------------------------------------------|
| `campaign.list`  | List campaigns with optional pagination (`page`, `per_page`).               | `{ "page": number?, "per_page": number? }`    |
| `campaign.create`| Create a new campaign (requires `name` and `workspace`; optional fields `from_name`, `daily_limit`). | `{ "name": string, "workspace": string, "from_name"?: string, "daily_limit"?: number }` |
| `analytics.overview` | Retrieve overview analytics across campaigns, with optional date filters (`from_date`, `to_date`). | `{ "from_date"?: string, "to_date"?: string }` |

You can extend the server by defining additional tools following the pattern in `src/index.ts`.

## Deployment

You can deploy this server on any hosting platform that supports Node.js, such as **Vercel**, **Fly.io**, **Render**, or your own VPS. For instance, to deploy on Vercel:

1. Create a new Vercel project and import this repository.
2. Set up the environment variables (`INSTANTLY_API_KEY`, `INSTANTLY_API_BASE`, `PORT`) in the Vercel dashboard.
3. After deployment, Vercel will provide a URL like `https://your-project.vercel.app/sse`. Use this URL as the **MCP Server URL** in ChatGPT’s Connectors settings.

## License

This project is provided as-is without any warranty. You are free to use, modify, and distribute it for your own purposes.