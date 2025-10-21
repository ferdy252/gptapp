# Multi-stage Docker build for production

FROM node:18-alpine AS base

# Build client MCP widgets
FROM base AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build:mcp

# Server build
FROM base AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/src ./src

# Production image
FROM base AS production
WORKDIR /app

# Copy server files
COPY --from=server /app/server /app/server
# Copy built MCP widgets
COPY --from=client /app/client/dist /app/client/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
WORKDIR /app/server
CMD ["node", "src/index.js"]
