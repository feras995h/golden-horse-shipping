#!/bin/bash

# VPS Deployment Fix Script
# This script will fix the deployment issues on the VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Starting VPS Deployment Fix..."

# Step 1: Find project directory
print_status "📁 Finding project directory..."
PROJECT_DIR=""
if [ -d "/root/موقع وائل 2" ]; then
    PROJECT_DIR="/root/موقع وائل 2"
elif [ -d "/home/*/موقع وائل 2" ]; then
    PROJECT_DIR=$(find /home -name "موقع وائل 2" -type d 2>/dev/null | head -1)
elif [ -d "/var/www/موقع وائل 2" ]; then
    PROJECT_DIR="/var/www/موقع وائل 2"
elif [ -d "موقع وائل 2" ]; then
    PROJECT_DIR="./موقع وائل 2"
else
    print_error "Project directory not found!"
    exit 1
fi

print_success "Found project at: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 2: Pull latest changes
print_status "📥 Pulling latest changes from Git..."
git fetch origin
git pull origin main
print_success "Code updated successfully"

# Step 3: Stop existing containers
print_status "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true
print_success "Containers stopped"

# Step 4: Update environment files
print_status "⚙️ Updating environment files..."

# Backend environment
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/golden_horse_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_API_URL=/api
SHIPSGO_API_URL=https://api.shipsgo.com
SHIPSGO_API_KEY=your-shipsgo-api-key
SHIPSGO_USERNAME=your-username
SHIPSGO_PASSWORD=your-password
EOF

# Frontend environment
cat > frontend/.env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME=Golden Horse Shipping
NEXT_PUBLIC_DEFAULT_LANGUAGE=ar
EOF

print_success "Environment files updated"

# Step 5: Clean Docker system
print_status "🧹 Cleaning Docker system..."
docker system prune -f
docker volume prune -f
print_success "Docker system cleaned"

# Step 6: Build and start containers
print_status "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
print_success "Containers built and started"

# Step 7: Wait for services to start
print_status "⏳ Waiting for services to start..."
sleep 30

# Step 8: Check container status
print_status "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Step 9: Check logs
print_status "📋 Checking service logs..."
echo "=== Backend Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo "=== Frontend Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 frontend

echo "=== Nginx Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 nginx

# Step 10: Test endpoints
print_status "🧪 Testing endpoints..."

# Test backend health
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed"
fi

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend is not accessible"
fi

# Test nginx
if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Nginx is working"
else
    print_warning "Nginx is not working"
fi

# Step 11: Show final status
print_status "📈 Final Status Report:"
echo "=================================="
echo "🔗 Application URLs:"
echo "   - Main Site: http://your-vps-ip"
echo "   - Frontend: http://your-vps-ip:3000"
echo "   - Backend API: http://your-vps-ip:3001/api"
echo "   - API Docs: http://your-vps-ip:3001/api/docs"
echo "=================================="

# Step 12: Show running containers
print_status "📦 Running Containers:"
docker-compose -f docker-compose.prod.yml ps

print_success "🎉 VPS Deployment Fix Complete!"
print_status "💡 If you still have issues, check the logs above for errors."

# Quick troubleshooting commands
echo ""
print_status "🔧 Quick Troubleshooting Commands:"
echo "   - Check logs: docker-compose -f docker-compose.prod.yml logs [service]"
echo "   - Restart service: docker-compose -f docker-compose.prod.yml restart [service]"
echo "   - Check status: docker-compose -f docker-compose.prod.yml ps"
echo "   - View all logs: docker-compose -f docker-compose.prod.yml logs -f"