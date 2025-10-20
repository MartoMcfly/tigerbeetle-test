#!/bin/bash

# Development startup script for Blockchain Omnibus Demo

set -e

echo "🚀 Starting Blockchain Omnibus Demo"
echo ""

# Check if TigerBeetle is set up
if [ ! -f "tigerbeetle-bin/tigerbeetle" ]; then
    echo "❌ TigerBeetle not found. Running setup..."
    npm run setup:tigerbeetle
    echo ""
fi

# Check if data file exists
if [ ! -f "data.tigerbeetle" ]; then
    echo "❌ TigerBeetle data file not found. Initializing..."
    ./tigerbeetle-bin/tigerbeetle format --cluster=0 --replica=0 --replica-count=1 data.tigerbeetle
    echo ""
fi

# Build shared package if needed
if [ ! -d "packages/shared/dist" ]; then
    echo "📦 Building shared package..."
    cd packages/shared
    npm run build
    cd ../..
    echo ""
fi

# Start TigerBeetle in background
echo "🐯 Starting TigerBeetle server..."
./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle > tigerbeetle.log 2>&1 &
TIGERBEETLE_PID=$!
echo "   TigerBeetle PID: $TIGERBEETLE_PID"
sleep 2

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $TIGERBEETLE_PID 2>/dev/null || true
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend in background
echo "🖥️  Starting backend server..."
cd packages/backend
npm run dev > ../../backend.log 2>&1 &
BACKEND_PID=$!
cd ../..
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/admin/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    sleep 1
done

# Start frontend
echo "🌐 Starting frontend..."
cd packages/frontend
npm run dev

# This will keep the script running until Ctrl+C
wait

