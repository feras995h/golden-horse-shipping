#!/bin/bash

# Golden Horse Shipping - Final Healthcheck Fix Script
# سكريبت الإصلاح النهائي لفحص الصحة

set -e

echo "🚢 Golden Horse Shipping - Final Healthcheck Fix"
echo "================================================"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found in current directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Stop and remove existing container
echo "🛑 Stopping existing containers..."
docker stop golden-horse-shipping 2>/dev/null || true
docker rm golden-horse-shipping 2>/dev/null || true

# Build new image
echo "🔨 Building Docker image with final healthcheck fix..."
docker build -t golden-horse-shipping:latest .

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set in environment"
    read -p "Enter your DATABASE_URL: " DATABASE_URL
    export DATABASE_URL
fi

# Run container with enhanced configuration
echo "🚀 Starting container with final healthcheck configuration..."
docker run -d \
    --name golden-horse-shipping \
    --restart unless-stopped \
    -p 3000:3000 \
    -p 3001:3001 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e NODE_ENV=production \
    -e PORT=3001 \
    -e FRONTEND_PORT=3000 \
    -e BACKEND_PORT=3001 \
    golden-horse-shipping:latest

echo "⏳ Container started. Waiting for services to initialize..."
echo "   This may take up to 2 minutes due to enhanced startup sequence..."

# Wait for container to be ready
sleep 30

# Show container status
echo "📊 Container Status:"
docker ps --filter name=golden-horse-shipping --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Wait for healthcheck to start
echo "⏳ Waiting for healthcheck to begin (120 seconds startup period)..."
sleep 90

# Monitor healthcheck status
echo "🔍 Monitoring healthcheck status..."
for i in {1..10}; do
    echo "Check $i/10:"
    
    # Get container health status
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' golden-horse-shipping 2>/dev/null || echo "no-healthcheck")
    echo "  Health Status: $HEALTH_STATUS"
    
    # Try manual health check
    echo "  Manual Check:"
    if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "    ✅ API Health endpoint responding"
        HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
        echo "    Response: $HEALTH_RESPONSE"
    else
        echo "    ❌ API Health endpoint not responding"
    fi
    
    # Check if healthy
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo "🎉 Container is healthy!"
        break
    fi
    
    if [ $i -eq 10 ]; then
        echo "⚠️  Healthcheck still not passing after extended wait"
        echo "📋 Showing recent container logs for diagnosis:"
        docker logs --tail 20 golden-horse-shipping
        
        echo ""
        echo "🔧 Troubleshooting Commands:"
        echo "  View logs: docker logs -f golden-horse-shipping"
        echo "  Check health: docker inspect --format='{{json .State.Health}}' golden-horse-shipping"
        echo "  Test API: curl http://localhost:3001/api/health"
        echo "  Container shell: docker exec -it golden-horse-shipping sh"
    else
        echo "  Waiting 30 seconds before next check..."
        sleep 30
    fi
done

echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001/api"
echo "  Health Check: http://localhost:3001/api/health"

echo ""
echo "📋 Useful Commands:"
echo "  Monitor logs: docker logs -f golden-horse-shipping"
echo "  Check status: docker ps"
echo "  Stop container: docker stop golden-horse-shipping"
echo "  Restart container: docker restart golden-horse-shipping"

echo ""
echo "✅ Final healthcheck fix deployment completed!"