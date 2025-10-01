#!/bin/bash

# Quick Healthcheck Fix Script for Golden Horse Shipping
# This script fixes the Docker healthcheck issue and redeploys the application

echo "🔧 Golden Horse Shipping - Healthcheck Fix Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found. Please run this script from the project root directory."
    exit 1
fi

echo "📋 Current status check..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check current container status
CONTAINER_NAME="golden-horse-app"
if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "📦 Found existing container: ${CONTAINER_NAME}"
    
    # Stop and remove existing container
    echo "🛑 Stopping existing container..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    
    echo "🗑️ Removing existing container..."
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
else
    echo "📦 No existing container found"
fi

# Build new image with healthcheck fix
echo "🔨 Building new Docker image with healthcheck fix..."
docker build -t golden-horse-shipping . || {
    echo "❌ Error: Failed to build Docker image"
    exit 1
}

echo "✅ Docker image built successfully"

# Get database URL from environment or prompt user
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not set in environment"
    echo "Please provide your database URL:"
    read -p "DATABASE_URL: " DATABASE_URL
fi

# Run new container
echo "🚀 Starting new container with healthcheck fix..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e BACKEND_PORT=3001 \
    -e FRONTEND_PORT=3000 \
    --restart unless-stopped \
    golden-horse-shipping || {
    echo "❌ Error: Failed to start container"
    exit 1
}

echo "✅ Container started successfully"

# Wait for application to start
echo "⏳ Waiting for application to start (60 seconds)..."
sleep 60

# Check container health
echo "🔍 Checking container health..."
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null || echo "no-healthcheck")

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✅ Container is healthy!"
elif [ "$HEALTH_STATUS" = "starting" ]; then
    echo "⏳ Container is still starting up..."
    echo "💡 Check status in a few minutes with: docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME}"
else
    echo "⚠️ Container health status: $HEALTH_STATUS"
fi

# Test API endpoint
echo "🧪 Testing API health endpoint..."
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API health endpoint is responding"
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3001/api"
    echo "   Health Check: http://localhost:3001/api/health"
else
    echo "⚠️ API health endpoint not responding yet"
    echo "💡 This is normal during startup. Check again in a few minutes."
fi

# Show container logs
echo "📋 Recent container logs:"
docker logs --tail=20 ${CONTAINER_NAME}

echo ""
echo "🎉 Healthcheck fix deployment completed!"
echo ""
echo "📊 Monitoring commands:"
echo "   Check container status: docker ps"
echo "   Check health status: docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME}"
echo "   View logs: docker logs -f ${CONTAINER_NAME}"
echo "   Test API: curl http://localhost:3001/api/health"
echo ""
echo "🆘 If issues persist, check the logs and ensure:"
echo "   1. Database connection is working"
echo "   2. All environment variables are set correctly"
echo "   3. Ports 3000 and 3001 are not used by other applications"