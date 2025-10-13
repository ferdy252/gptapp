# Setup Guide

Complete setup instructions for the Home Repair Diagnosis ChatGPT app.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **OpenAI API Key** - [Get yours](https://platform.openai.com/api-keys)
3. **Git** - For version control

## Local Development Setup

### 1. Clone & Install

```bash
# Clone repository (or navigate to project folder)
cd untitled\ folder

# Install all dependencies (server + client)
npm install
```

This will install dependencies for both workspaces.

### 2. Configure Environment Variables

```bash
# Create server .env file
cd server
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
```

**Required variables:**
- `OPENAI_API_KEY`: Your OpenAI API key (get from platform.openai.com)

**Optional variables:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS origins (default includes localhost)

### 3. Start Development Servers

**Option A: Run both together**
```bash
# From project root
npm run dev        # Starts server on :3000
npm run dev:client # Starts client on :5173 (separate terminal)
```

**Option B: Run separately**
```bash
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Client
cd client
npm run dev
```

### 4. Test the Server

```bash
# Check health endpoint
curl http://localhost:3000/health

# Check MCP manifest
curl http://localhost:3000/mcp/manifest
```

Expected response:
```json
{
  "name": "Home Repair Diagnosis",
  "version": "1.0.0",
  "tools": [...]
}
```

### 5. View Client UI

Open browser: http://localhost:5173

You should see the 3 main components:
1. **Issue Summary Card** - Diagnosis with DIY/Hire recommendation
2. **Parts & Tools Card** - Checklist with toggles
3. **Steps View** - Fullscreen accordion (click "See Steps")

## Connect to ChatGPT (Development)

To test with actual ChatGPT:

### 1. Expose Local Server via ngrok

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000
```

Copy the **HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### 2. Add to ChatGPT

1. Go to **ChatGPT** (chatgpt.com)
2. Click **Settings** (bottom left)
3. Go to **Apps** tab
4. Click **Add App**
5. Enter: `https://abc123.ngrok.io/mcp`
6. Click **Connect**
7. Authorize the app

### 3. Test in ChatGPT

Try these prompts:

```
"I have a leaking kitchen faucet. Can you help diagnose it?"

"My toilet keeps running. What could be wrong?"

"There's a crack in my drywall. Is this DIY or should I hire someone?"
```

ChatGPT will call your local server's tools and render the UI cards.

## Testing the Tools

### Test analyze_issue

```bash
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "analyze_issue",
    "input": {
      "photos": ["https://example.com/faucet.jpg"],
      "description": "Kitchen faucet is dripping from the base"
    }
  }'
```

### Test generate_plan

```bash
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_plan",
    "input": {
      "issue_type": "Leaking faucet",
      "risk_level": "low"
    }
  }'
```

### Test generate_bom

```bash
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_bom",
    "input": {
      "issue_type": "Leaking faucet"
    }
  }'
```

### Test request_quotes

```bash
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "request_quotes",
    "input": {
      "zip": "90210",
      "scope": "Replace leaking kitchen faucet",
      "confirmed": true
    }
  }'
```

## Project Structure

```
untitled folder/
├── server/                    # MCP server (Node.js + Express)
│   ├── src/
│   │   ├── index.js          # Server entry point
│   │   ├── routes/
│   │   │   └── mcp.js        # MCP endpoints
│   │   ├── tools/            # 4 core tools
│   │   │   ├── analyze.js    # Vision + safety gates
│   │   │   ├── plan.js       # Step-by-step plan
│   │   │   ├── bom.js        # Parts & tools list
│   │   │   └── quotes.js     # Contractor quotes
│   │   └── utils/
│   │       ├── logger.js     # PII-redacting logger
│   │       └── validation.js # Zod schemas
│   └── package.json
│
├── client/                    # Apps SDK UI (React + Vite)
│   ├── src/
│   │   ├── main.jsx          # Entry point
│   │   ├── App.jsx           # Main app component
│   │   ├── index.css         # Global styles
│   │   └── components/       # 3 UI widgets
│   │       ├── IssueSummary.jsx     # Inline card
│   │       ├── PartsAndTools.jsx    # Inline card
│   │       └── StepsView.jsx        # Fullscreen
│   └── package.json
│
├── README.md                  # Overview
├── SETUP.md                   # This file
├── DEPLOYMENT.md              # Production deployment
├── SECURITY.md                # Security policy
└── package.json               # Workspace config
```

## Customization

### Add New Safety Keywords

Edit `server/src/tools/analyze.js`:

```javascript
const HIGH_RISK_KEYWORDS = [
  'gas', 'electrical panel', 'roof', 'structural',
  'your-new-keyword-here'  // Add here
];
```

### Change Brand Colors

Edit `client/src/index.css`:

```css
.btn-primary {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);
}
```

### Adjust Rate Limits

Edit `server/.env`:

```bash
RATE_LIMIT_WINDOW_MS=900000      # 15 min
RATE_LIMIT_MAX_REQUESTS=200      # Increase to 200
```

## Troubleshooting

### Server won't start

**Error**: `OPENAI_API_KEY not found`  
**Fix**: Add key to `server/.env`

**Error**: `Port 3000 already in use`  
**Fix**: Change PORT in `.env` or kill process: `lsof -ti:3000 | xargs kill`

### Client won't build

**Error**: `Cannot find module 'react'`  
**Fix**: `cd client && npm install`

### Tools return errors

**Error**: `Vision analysis failed`  
**Fix**: Check API key validity, OpenAI quota at platform.openai.com

**Error**: `Validation failed`  
**Fix**: Review tool input schemas in `server/src/utils/validation.js`

### ChatGPT can't connect

**Error**: `Connection refused`  
**Fix**: Ensure ngrok is running and URL is correct

**Error**: `CORS error`  
**Fix**: Add ngrok URL to `ALLOWED_ORIGINS` in `.env`

## Next Steps

1. ✅ **Test locally** - Verify all 4 tools work
2. ✅ **Connect to ChatGPT** - Use ngrok for testing
3. ✅ **Deploy to production** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. ✅ **Add real contractor APIs** - Integrate HomeAdvisor/Thumbtack
5. ✅ **Enable caching** - Add Redis for repeated queries
6. ✅ **Monitor usage** - Set up logging/analytics

## Getting Help

- **Documentation**: OpenAI Apps SDK - https://developers.openai.com/apps-sdk
- **API Reference**: OpenAI Vision - https://platform.openai.com/docs/guides/vision
- **Community**: OpenAI Forum - https://community.openai.com

## Development Tips

### Hot Reload

Both server and client support hot reload:
- **Server**: Uses `node --watch` (Node 18+)
- **Client**: Vite HMR (instant updates)

### Debug Mode

Enable verbose logging:

```bash
# Server
NODE_ENV=development npm run dev

# Check logs in terminal
```

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- REST Client (test API endpoints)

### Sample `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

**Ready to build?** Start both servers and open http://localhost:5173 🚀
