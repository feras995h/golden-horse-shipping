#!/bin/bash

# Start script for running both frontend and backend

echo "Starting Golden Horse Shipping Application..."

# Start backend in background
echo "Starting Backend on port ${BACKEND_PORT:-3001}..."
cd /app/backend && PORT=${BACKEND_PORT:-3001} node dist/main.js &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 5

# Start frontend
echo "Starting Frontend on port ${FRONTEND_PORT:-3000}..."
cd /app/frontend && PORT=${FRONTEND_PORT:-3000} npm start &
FRONTEND_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

echo "Both services started successfully!"
echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "Backend API: http://localhost:${BACKEND_PORT:-3001}/api"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID