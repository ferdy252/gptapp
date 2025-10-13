#!/bin/bash
# Quick development startup script

echo "🚀 Starting Home Repair Diagnosis App..."

# Check if .env exists
if [ ! -f server/.env ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp server/.env.example server/.env
  echo "📝 Please edit server/.env and add your OPENAI_API_KEY"
  exit 1
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Start both servers
echo "✅ Starting development servers..."
echo "   Server: http://localhost:3000"
echo "   Client: http://localhost:5173"
echo ""

# Start server in background
cd server && npm run dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 2

# Start client
cd ../client && npm run dev

# Cleanup on exit
trap "kill $SERVER_PID" EXIT
