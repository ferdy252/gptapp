import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerResources } from './resources.js';
import { registerTools, toolManifest } from './tools.js';

export const SERVER_METADATA = {
  name: 'Home Repair Diagnosis',
  version: '1.0.0',
  description: 'AI-powered home repair diagnosis with structured UI components'
};

export function createServer() {
  const server = new McpServer({
    name: SERVER_METADATA.name,
    version: SERVER_METADATA.version,
    description: SERVER_METADATA.description
  });

  registerResources(server);
  registerTools(server);

  return server;
}

export { toolManifest };
