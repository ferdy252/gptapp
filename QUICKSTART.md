# Quick Start Guide

Get the Home Repair Diagnosis ChatGPT app running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

This installs both server and client dependencies.

## 2. Add Your OpenAI API Key

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add:
```
OPENAI_API_KEY=sk-your-key-here
```

Get your key at: https://platform.openai.com/api-keys

## 3. Start Development Servers

**Option A: Use helper script**
```bash
./scripts/dev.sh
```

**Option B: Manual start**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## 4. Test the App

**View UI**: http://localhost:5173

**Test API**:
```bash
curl http://localhost:3000/health
```

## 5. Connect to ChatGPT

### Development (ngrok):
```bash
# Install ngrok
brew install ngrok

# Expose server
ngrok http 3000
```

### Production:
Deploy to Railway/Render/Fly.io - see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Add to ChatGPT:
1. Go to ChatGPT → Settings → Apps
2. Add app with URL: `https://your-url/mcp`
3. Test: *"I have a leaking faucet, help diagnose it"*

---

**Next steps**: See [SETUP.md](./SETUP.md) for detailed configuration options.
