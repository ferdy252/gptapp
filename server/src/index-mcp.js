/**
 * Express Server wrapping MCP Server
 * Provides HTTP/SSE endpoints for ChatGPT Apps SDK
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import mcpServer from './mcp-server.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Needed for iframe embedding
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://chatgpt.com'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// MCP manifest endpoint
app.get('/mcp/manifest', async (req, res) => {
  try {
    // Return simple manifest for now
    res.json({
      name: 'Home Repair Diagnosis',
      version: '1.0.0',
      description: 'Analyzes home repair issues and provides DIY vs hire recommendations',
      tools: [
        { name: 'analyze_issue', description: 'Analyzes photos and description to diagnose a home repair issue' },
        { name: 'generate_plan', description: 'Generates a step-by-step repair plan' },
        { name: 'generate_bom', description: 'Generates bill of materials' },
        { name: 'request_quotes', description: 'Request contractor quotes' },
        { name: 'submit_outcome', description: 'Submit repair outcome' }
      ]
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// MCP SSE endpoint (primary endpoint for ChatGPT)
app.get('/mcp', async (req, res) => {
  console.log('📡 MCP SSE connection established');
  
  const transport = new SSEServerTransport('/mcp', res);
  await mcpServer.connect(transport);
  
  // Keep connection alive
  req.on('close', () => {
    console.log('📡 MCP SSE connection closed');
  });
});

// MCP POST endpoint (for tool execution)
app.post('/mcp', async (req, res) => {
  try {
    console.log('🔧 Tool execution request:', req.body);
    
    const { method, params } = req.body;
    
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      // Execute tool
      const result = await mcpServer.callTool(name, args);
      
      res.json({
        content: result.content,
        isError: false
      });
    } else {
      res.status(400).json({ error: 'Unsupported method' });
    }
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Home Repair Diagnosis MCP Server

Server running on port ${PORT}
MCP Endpoint: http://localhost:${PORT}/mcp
Health Check: http://localhost:${PORT}/health
Manifest: http://localhost:${PORT}/mcp/manifest

Environment: ${process.env.NODE_ENV || 'development'}
OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}
  `);
});

export default app;
