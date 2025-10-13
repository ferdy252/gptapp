# Deployment Guide

This guide covers deploying the Home Repair Diagnosis ChatGPT app to production.

## Prerequisites

1. ✅ OpenAI API key (for Vision & GPT-4o)
2. ✅ Hosting platform account (Railway, Render, Fly.io, or Vercel)
3. ✅ Domain/HTTPS endpoint (required for ChatGPT Apps)

## Quick Deploy Options

### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add environment variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://chatgpt.com

# Deploy
railway up
```

Railway automatically provides HTTPS. Copy your app URL for ChatGPT connection.

### Option 2: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect your repository
5. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add OPENAI_API_KEY, NODE_ENV=production
6. Deploy

Render provides free HTTPS at `https://your-app.onrender.com`

### Option 3: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secrets
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set NODE_ENV=production

# Deploy
fly deploy
```

### Option 4: Local Development with ngrok

For testing before production deploy:

```bash
# Terminal 1: Start server
cd server
npm install
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000
```

Use the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`) in ChatGPT.

## Connect to ChatGPT

Once deployed:

1. Go to **ChatGPT → Settings → Apps**
2. Click **Add App**
3. Enter your app's HTTPS URL + `/mcp`
   - Example: `https://your-app.onrender.com/mcp`
4. Authorize the app
5. Test with: _"I have a leaking faucet, can you help diagnose it?"_

## Environment Variables

Required for all deployments:

```bash
OPENAI_API_KEY=sk-...                           # Your OpenAI API key
NODE_ENV=production                              # Set to production
PORT=3000                                        # Server port (usually auto-set)
ALLOWED_ORIGINS=https://chatgpt.com             # CORS allowed origins
DATA_RETENTION_DAYS=30                          # Data retention policy
RATE_LIMIT_WINDOW_MS=900000                     # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100                     # Max requests per window
```

## Security Checklist

Before going live, verify:

- ✅ HTTPS enabled (required for ChatGPT Apps)
- ✅ OPENAI_API_KEY in environment variables (not hardcoded)
- ✅ CORS restricted to `https://chatgpt.com`
- ✅ Rate limiting enabled
- ✅ Input validation on all tools
- ✅ PII redaction in logs
- ✅ File size limits enforced (5MB per photo)
- ✅ Max 5 photos per request
- ✅ Confirmation required for quote requests

## Monitoring

### Health Check

```bash
curl https://your-app.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Logs

Most platforms provide built-in logging:

- **Railway**: `railway logs`
- **Render**: Dashboard → Logs tab
- **Fly.io**: `fly logs`

Monitor for:
- API errors (OpenAI rate limits)
- Security events (blocked CORS, rate limits)
- Tool execution failures

## Scaling

For production traffic:

1. **API Key Management**: Use OpenAI organization keys with billing limits
2. **Caching**: Add Redis for BOM/plan caching (same issue type)
3. **CDN**: Cache static client assets
4. **Database**: Add PostgreSQL for quote request tracking
5. **Queue**: Use Bull/BullMQ for contractor outreach jobs

## Cost Estimates

### API Costs (OpenAI)

- **Vision analysis**: ~$0.01 per request (GPT-4o)
- **Plan generation**: ~$0.005 per request
- **BOM generation**: ~$0.003 per request

Avg cost per diagnosis: **$0.02-$0.03**

### Hosting Costs

- **Railway**: Free tier (500 hrs/month), then $5/month
- **Render**: Free tier (limited hours), then $7/month
- **Fly.io**: Free tier (3 apps), then $1.94/month per app
- **Vercel**: Free tier, then $20/month

## Troubleshooting

### ChatGPT Can't Connect

- Verify HTTPS is enabled
- Check `/mcp/manifest` endpoint returns JSON
- Ensure CORS allows `https://chatgpt.com`
- Check server logs for errors

### Tool Execution Fails

- Verify OPENAI_API_KEY is set correctly
- Check API quota/billing at platform.openai.com
- Review validation errors in server logs
- Test tools directly: `POST /mcp/execute`

### Photos Not Uploading

- Check file size < 5MB per photo
- Verify Content-Type is image/jpeg, image/png, or image/webp
- Ensure multer middleware is active
- Check server memory limits

## Data Retention Policy

Per security requirements:

- **Photos**: Deleted immediately after analysis (in-memory only)
- **Diagnoses**: Retained 30 days
- **Quote requests**: Retained 90 days
- **Logs**: Retained 7 days (PII redacted)

Implement scheduled cleanup:

```bash
# Add to cron or use platform scheduler
node scripts/cleanup.js
```

## Updates & Maintenance

To update the app:

```bash
# Pull latest changes
git pull origin main

# Railway
railway up

# Render (auto-deploys from GitHub)
git push origin main

# Fly.io
fly deploy
```

No downtime required—platforms handle rolling updates.

## Support

For issues:
1. Check logs first
2. Review OpenAI API status: status.openai.com
3. Test endpoints with curl/Postman
4. Check platform status pages
