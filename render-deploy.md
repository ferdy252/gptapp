# 🚀 Render Deployment Guide

## Quick Deploy Steps

### 1. Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com/new
2. Name: `home-repair-diagnosis`
3. Make it **Public** (or Private with paid plan)
4. Don't initialize with README
5. Click "Create repository"

**Then push your code:**
```bash
cd "/Users/ferdy/Desktop/untitled folder"
git remote add origin https://github.com/YOUR-USERNAME/home-repair-diagnosis.git
git branch -M main
git push -u origin main
```

---

### 2. Deploy on Render

1. **Go to:** https://render.com
2. **Sign up/Login** (can use GitHub account)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"** → Find your repo
5. **Configure:**

**Build Settings:**
```
Name: home-repair-diagnosis
Region: Oregon (US West)
Branch: main
Root Directory: (leave blank)
Build Command: cd server && npm install
Start Command: cd server && npm start
```

**Environment Variables:**
Click **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `<your-openai-api-key>` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://chatgpt.com` |
| `PORT` | `3000` |

6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deployment

---

### 3. Get Your URL

Once deployed, you'll see:
```
https://home-repair-diagnosis.onrender.com
```

Copy this URL!

---

### 4. Connect to ChatGPT

1. Open **ChatGPT**
2. Go to **Settings → Apps**
3. Click **"Add App"**
4. Enter: `https://home-repair-diagnosis.onrender.com/mcp`
5. Click **"Add"**
6. Authorize the app

---

### 5. Test It!

In ChatGPT, say:
```
I have a leaking kitchen faucet. Can you help me diagnose and fix it?
```

ChatGPT will use your app to analyze the issue!

---

## Alternative: Deploy Without GitHub

If you don't want to use GitHub, you can use Render's CLI:

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

---

## Monitoring

**View Logs:**
- Go to your service on Render dashboard
- Click "Logs" tab
- See real-time requests

**Check Health:**
```bash
curl https://home-repair-diagnosis.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## Free Tier Limits

Render free tier includes:
- ✅ 750 hours/month (enough for testing)
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ⚠️  Spins down after 15 min inactivity (cold start ~30s)

For production, upgrade to **$7/month** for always-on.

---

## Troubleshooting

**Build fails?**
- Check that `server/package.json` exists
- Verify Node.js version compatibility

**App won't start?**
- Check environment variables are set
- Review logs in Render dashboard

**ChatGPT can't connect?**
- Verify URL ends with `/mcp`
- Check CORS settings in logs
- Ensure HTTPS (Render provides this automatically)

---

## Next: Update Code

To deploy updates:
```bash
git add .
git commit -m "Update: description"
git push
```

Render auto-deploys! 🚀
