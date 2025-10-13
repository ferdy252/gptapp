# Home Repair Diagnosis ChatGPT App

A ChatGPT app that analyzes 1-5 photos + description and returns:
- **Diagnosis card**: DIY vs Hire recommendation
- **Parts & Tools checklist**: Items, quantities, price ranges
- **Step-by-step fix plan**: Safety-gated repair instructions
- **Get 3 quotes action**: Contractor outreach

![ChatGPT Apps SDK](https://img.shields.io/badge/ChatGPT-Apps%20SDK-10a37f?logo=openai)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)

## ✨ Features

- 🔍 **Vision-based diagnosis** using GPT-4o Vision API
- ⚠️ **Safety gates** for high-risk repairs (gas, electrical, structural)
- 📋 **Step-by-step plans** with time estimates and safety notes
- ✅ **Progress tracking** - Checkboxes, timer, and live updates
- 🛠️ **Smart BOM generator** with price ranges
- 🏠 **Contractor matching** with quotes (mock for MVP)
- 📊 **Quick outcome reports** - 2-step feedback collection
- 🔒 **Enterprise security** (validation, rate limiting, PII redaction)
- ✅ **Apps SDK compliant** - Max 2 actions per card

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add OpenAI API key
cd server && cp .env.example .env
# Edit .env and add OPENAI_API_KEY=sk-...

# 3. Start development
./scripts/dev.sh
```

**Full guide**: See [QUICKSTART.md](./QUICKSTART.md)

## 📁 Project Structure

```
├── server/                 # MCP Server (Express + OpenAI)
│   ├── src/
│   │   ├── tools/         # 4 core tools (analyze, plan, BOM, quotes)
│   │   ├── routes/        # MCP endpoints
│   │   └── utils/         # Validation, logging
│   └── package.json
│
├── client/                 # Apps SDK UI (React + Vite)
│   ├── src/
│   │   └── components/    # 3 widgets (Summary, Parts, Steps)
│   └── package.json
│
├── SETUP.md               # Detailed setup guide
├── DEPLOYMENT.md          # Production deployment
├── SECURITY.md            # Security & privacy policy
├── AGENTKIT_WORKFLOW.md   # Workflow architecture
└── TESTING.md             # Test suite
```

## 🛡️ Security & Guardrails

✅ **Safety gates**: Auto-detect high-risk repairs (gas/electrical/structural)  
✅ **Input validation**: Zod schemas, file type/size limits  
✅ **Rate limiting**: 100 req/15min per IP  
✅ **PII redaction**: Automatic in logs  
✅ **HTTPS required**: TLS 1.2+  
✅ **Apps SDK compliance**: Max 2 actions per card, no nested scrolling

## 🔧 MCP Tools

### 1. analyze_issue
Analyzes photos using GPT-4o Vision, returns diagnosis + risk level

### 2. generate_plan
Creates 5-10 step repair instructions with safety notes

### 3. generate_bom
Generates parts/tools list with price ranges

### 4. request_quotes
Prepares contractor outreach (requires user confirmation)

### 5. submit_outcome
Simple 2-step outcome collection for continuous improvement

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed configuration
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[SECURITY.md](./SECURITY.md)** - Security policy
- **[AGENTKIT_WORKFLOW.md](./AGENTKIT_WORKFLOW.md)** - Workflow details
- **[TESTING.md](./TESTING.md)** - Testing guide

## 🌐 Deployment

### Railway (Recommended)
```bash
railway login
railway init
railway variables set OPENAI_API_KEY=sk-...
railway up
```

### Render
Push to GitHub, connect repo, deploy (auto HTTPS)

### Docker
```bash
docker build -t repair-diagnosis .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... repair-diagnosis
```

**Full guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🧪 Testing

```bash
# Test all tools
./scripts/test-tools.sh

# Manual tests
curl http://localhost:3000/health
curl http://localhost:3000/mcp/manifest
```

## 🤝 Contributing

This is an MVP. Future enhancements:
- Real contractor API integration (HomeAdvisor, Thumbtack)
- Redis caching for repeated queries
- Video tutorial links
- Multi-language support
- Mobile app (React Native)

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: https://developers.openai.com/apps-sdk
- **Issues**: File a GitHub issue
- **Security**: security@yourapp.com

---

Built with ❤️ using OpenAI Apps SDK & MCP
