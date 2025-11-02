#!/bin/bash

# Kill any existing servers
pkill -f "node server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 1

echo "🚀 Starting Contain-R..."
echo ""

# Start backend in background
echo "📦 Starting Backend Server (http://localhost:5000)..."
cd mock-backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

echo ""
echo "🎨 Starting Frontend Server (http://localhost:3000)..."
echo ""
echo "👥 Demo Credentials:"
echo "   Students:    230211160 (Aman) / 230122329 (Muskaan)"
echo "   Password:    password123"
echo "   Instructors: Atharv Bali / Amey Jhaldiyal"
echo "   Password:    admin123"
echo ""
echo "⚠️  Press Ctrl+C to stop both servers"
echo ""
echo "Opening browser..."
echo ""

# Start frontend with browser auto-open
BROWSER=default npm start

# When frontend stops, kill backend too
kill $BACKEND_PID 2>/dev/null