#!/bin/bash

# Railway Deployment Script for Home Repair Diagnosis App
# This script automates the deployment process

echo "🚀 Starting Railway Deployment..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🔐 Logging into Railway..."
echo "   (A browser window will open for authentication)"
railway login

echo ""
echo "🎯 Initializing Railway project..."
railway init

echo ""
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://chatgpt.com
railway variables set PORT=3000

echo ""
echo "🔑 Setting OpenAI API key..."
# Note: The actual key will be set separately for security
echo "   You'll need to set OPENAI_API_KEY manually after this script"

echo ""
echo "📦 Deploying application..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Set your OpenAI API key:"
echo "      railway variables set OPENAI_API_KEY=sk-your-key"
echo ""
echo "   2. Get your app URL:"
echo "      railway open"
echo ""
echo "   3. Connect to ChatGPT:"
echo "      - Go to ChatGPT → Settings → Apps"
echo "      - Add App"
echo "      - Enter: https://your-url/mcp"
echo ""
