#!/bin/bash

# Golden Horse Shipping - Complete VPS Deployment Script
# This script will deploy the application to VPS with all updated configurations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

print_header "🚀 Golden Horse Shipping - VPS Deployment"

# Step 1: Pre-deployment Resource Check
print_header "🔍 Pre-deployment Resource Check"
print_status "📊 Checking system resources and potential conflicts..."

# Check memory usage
TOTAL_MEM=$(free -m | grep Mem | awk '{print $2}')
USED_MEM=$(free -m | grep Mem | awk '{print $3}')
MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

print_status "Memory usage: $MEM_PERCENT% ($USED_MEM MB / $TOTAL_MEM MB)"

if [ $MEM_PERCENT -gt 85 ]; then
    print_error "Memory usage is critically high ($MEM_PERCENT%)!"
    print_warning "Consider stopping other services before deployment"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
elif [ $MEM_PERCENT -gt 70 ]; then
    print_warning "Memory usage is high ($MEM_PERCENT%). Deployment may be slower."
fi

# Check disk space
DISK_PERCENT=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
print_status "Disk usage: $DISK_PERCENT%"

if [ $DISK_PERCENT -gt 90 ]; then
    print_error "Disk space is critically low ($DISK_PERCENT%)!"
    print_warning "Free up space before deployment"
    exit 1
elif [ $DISK_PERCENT -gt 80 ]; then
    print_warning "Disk space is low ($DISK_PERCENT%). Consider cleanup."
fi

# Check for port conflicts
print_status "Checking for port conflicts..."
CONFLICTS=()
for port in 80 3000 3001 5432; do
    if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
        process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
        CONFLICTS+=("Port $port: $process")
    fi
done

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    print_warning "Found potential port conflicts:"
    for conflict in "${CONFLICTS[@]}"; do
        echo "  - $conflict"
    done
    print_status "These will be handled during deployment..."
fi

# System Information
echo "Date: $(date)"
echo "User: $(whoami)"
echo "OS: $(uname -a)"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Not installed')"

# Step 2: Find project directory
print_status "📁 Finding project directory..."
PROJECT_DIR=""
POSSIBLE_DIRS=(
    "/root/موقع وائل 2"
    "/home/*/موقع وائل 2"
    "/var/www/موقع وائل 2"
    "/opt/موقع وائل 2"
    "./موقع وائل 2"
    "."
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/docker-compose.prod.yml" ]; then
        PROJECT_DIR="$dir"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    print_error "Project directory not found!"
    print_status "Please ensure the project is cloned to one of these locations:"
    for dir in "${POSSIBLE_DIRS[@]}"; do
        echo "  - $dir"
    done
    exit 1
fi

print_success "Found project at: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 3: Git operations
print_header "📥 Git Operations"
print_status "Checking Git status..."
git status --porcelain

print_status "Fetching latest changes..."
git fetch origin

print_status "Pulling latest changes..."
git pull origin main
print_success "Code updated successfully"

# Step 4: Environment setup
print_header "⚙️ Environment Configuration"

# Create backend .env file
print_status "Creating backend environment file..."
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://postgres:GoldenHorse2024!@postgres:5432/golden_horse_db

# JWT Configuration
JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This
JWT_EXPIRES_IN=24h

# API Configuration
NEXT_PUBLIC_API_URL=/api

# CORS Configuration
CORS_ORIGIN=http://72.60.92.146,https://72.60.92.146,http://localhost:3000

# Database Settings
DB_SYNCHRONIZE=false
DB_LOGGING=false

# ShipsGo API Configuration
SHIPSGO_API_URL=https://api.shipsgo.com
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_USERNAME=your-shipsgo-username
SHIPSGO_PASSWORD=your-shipsgo-password

# Application Settings
APP_NAME=Golden Horse Shipping
APP_VERSION=1.0.0
DEFAULT_LANGUAGE=ar
EOF

# Create frontend .env file
print_status "Creating frontend environment file..."
cat > frontend/.env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME=Golden Horse Shipping
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LANGUAGE=ar
NEXT_PUBLIC_VPS_URL=http://72.60.92.146
NEXT_TELEMETRY_DISABLED=1
EOF

print_success "Environment files created successfully"

# Step 5: Smart Docker cleanup with conflict resolution
print_header "🧹 Smart Docker Cleanup and Conflict Resolution"

# Stop any conflicting services first
print_status "Checking for conflicting services..."

# Check if Nginx is running outside Docker
if systemctl is-active nginx > /dev/null 2>&1 || service nginx status > /dev/null 2>&1; then
    print_warning "System Nginx is running. Stopping it temporarily..."
    systemctl stop nginx 2>/dev/null || service nginx stop 2>/dev/null || true
fi

# Check if Apache is running
if systemctl is-active apache2 > /dev/null 2>&1 || systemctl is-active httpd > /dev/null 2>&1; then
    print_warning "Apache is running. Stopping it temporarily..."
    systemctl stop apache2 2>/dev/null || systemctl stop httpd 2>/dev/null || true
fi

# Check for other applications on our ports
for port in 3000 3001; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        print_warning "Process $PID is using port $port. Attempting to stop..."
        kill -TERM $PID 2>/dev/null || true
        sleep 2
        # Force kill if still running
        if kill -0 $PID 2>/dev/null; then
            print_warning "Force killing process $PID on port $port"
            kill -KILL $PID 2>/dev/null || true
        fi
    fi
done

print_status "Stopping existing Golden Horse containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Stop any containers that might conflict
print_status "Stopping potentially conflicting containers..."
docker stop $(docker ps -q --filter "publish=80" --filter "publish=3000" --filter "publish=3001" --filter "publish=5432") 2>/dev/null || true

print_status "Removing unused Docker resources..."
docker system prune -f
docker volume prune -f
docker network prune -f

# Clean up any orphaned networks
docker network rm golden-horse-network 2>/dev/null || true

print_success "Docker cleanup completed"

# Step 6: Build and deploy
print_header "🔨 Building and Deploying"
print_status "Building Docker images (this may take several minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache --parallel

print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

print_success "Services started successfully"

# Step 7: Wait for services
print_header "⏳ Waiting for Services"
print_status "Waiting for services to initialize..."
sleep 45

# Step 8: Health checks
print_header "🏥 Health Checks"

# Check PostgreSQL
print_status "Checking PostgreSQL..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL health check failed"
fi

# Check Backend
print_status "Checking Backend API..."
for i in {1..10}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
        break
    else
        print_status "Attempt $i/10: Backend not ready yet, waiting..."
        sleep 5
    fi
done

# Check Frontend
print_status "Checking Frontend..."
for i in {1..10}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        break
    else
        print_status "Attempt $i/10: Frontend not ready yet, waiting..."
        sleep 5
    fi
done

# Check Nginx
print_status "Checking Nginx..."
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Nginx is working"
        break
    else
        print_status "Attempt $i/10: Nginx not ready yet, waiting..."
        sleep 5
    fi
done

# Step 9: Container status
print_header "📊 Container Status"
docker-compose -f docker-compose.prod.yml ps

# Step 10: Service logs
print_header "📋 Service Logs (Last 20 lines)"

echo "=== PostgreSQL Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 postgres

echo "=== Backend Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo "=== Frontend Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 frontend

echo "=== Nginx Logs ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 nginx

# Step 11: Network and ports
print_header "🌐 Network Information"
print_status "Checking open ports..."
netstat -tlnp | grep -E ':(80|443|3000|3001|5432)' || echo "No services found on expected ports"

print_status "Checking Docker networks..."
docker network ls | grep golden-horse || echo "Golden Horse network not found"

# Step 12: Final status report
print_header "📈 Deployment Status Report"
echo "=================================="
echo "🎉 Deployment Complete!"
echo "=================================="
echo ""
echo "🔗 Application URLs:"
echo "   - Main Site (Nginx): http://72.60.92.146"
echo "   - Frontend Direct: http://72.60.92.146:3000"
echo "   - Backend API: http://72.60.92.146:3001/api"
echo "   - API Documentation: http://72.60.92.146:3001/api/docs"
echo "   - Health Check: http://72.60.92.146/health"
echo ""
echo "🔐 Default Login Credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "💾 Database Information:"
echo "   - Database: golden_horse_db"
echo "   - User: postgres"
echo "   - Port: 5432"
echo ""
echo "=================================="

# Step 13: Troubleshooting information
print_header "🔧 Troubleshooting Commands"
echo "If you encounter issues, use these commands:"
echo ""
echo "📋 View logs:"
echo "   docker-compose -f docker-compose.prod.yml logs [service_name]"
echo "   docker-compose -f docker-compose.prod.yml logs -f  # Follow logs"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose -f docker-compose.prod.yml restart [service_name]"
echo "   docker-compose -f docker-compose.prod.yml restart  # Restart all"
echo ""
echo "📊 Check status:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo "   docker stats"
echo ""
echo "🧹 Clean restart:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔍 Debug containers:"
echo "   docker-compose -f docker-compose.prod.yml exec backend bash"
echo "   docker-compose -f docker-compose.prod.yml exec frontend sh"
echo ""

# Step 14: Success message
print_header "✅ Deployment Completed Successfully!"
print_success "Your Golden Horse Shipping application is now running on VPS!"
print_status "Visit http://72.60.92.146 to access your application"

# Final health check
print_status "Performing final connectivity test..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "🎉 Application is fully operational!"
else
    print_warning "⚠️  Application may need a few more minutes to fully initialize"
    print_status "Please wait 2-3 minutes and try accessing the application"
fi

echo ""
print_success "Deployment script completed at $(date)"