import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer, SERVER_METADATA, toolManifest } from './mcp/server.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['https://chatgpt.com'];

const mcpServer = createServer();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/mcp/manifest', (req, res) => {
  res.json({
    name: SERVER_METADATA.name,
    version: SERVER_METADATA.version,
    description: SERVER_METADATA.description,
    tools: toolManifest
  });
});

app.get('/mcp', async (req, res) => {
  try {
    const transport = new SSEServerTransport('/mcp/messages', res, {
      enableDnsRebindingProtection: true,
      allowedOrigins: ALLOWED_ORIGINS
    });

    await transport.start();
    await mcpServer.connect(transport);
  } catch (error) {
    logger.error('Failed to establish MCP SSE connection', error);
    res.status(500).end('Failed to establish MCP connection');
  }
});

app.post('/mcp/messages', async (req, res) => {
  const transport = mcpServer.getActiveTransport(req.query.sessionId);
  if (!transport || !(transport instanceof SSEServerTransport)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    await transport.handlePostMessage(req, res);
  } catch (error) {
    logger.error('Failed to handle MCP message', error);
    if (!res.headersSent) {
      res.status(500).end('Failed to process message');
    }
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 MCP Server running on port ${PORT}`);
  logger.info(`📝 Manifest name: ${SERVER_METADATA.name}`);
  logger.info(`🔒 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
