#!/bin/bash

# VPS Diagnostic Script for Docker Application
# تشخيص شامل لحالة التطبيق على VPS

echo "=========================================="
echo "🔍 VPS Diagnostic Script Started"
echo "=========================================="

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

# 1. System Information
print_status "📊 System Information"
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Uptime: $(uptime)"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory Usage: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo ""

# 2. Find project directory
print_status "📁 Finding project directory"
PROJECT_DIRS=$(find / -name "docker-compose.prod.yml" 2>/dev/null)
if [ -z "$PROJECT_DIRS" ]; then
    print_error "docker-compose.prod.yml not found!"
    echo "Searching for docker-compose.yml..."
    PROJECT_DIRS=$(find / -name "docker-compose.yml" 2>/dev/null)
fi

if [ -z "$PROJECT_DIRS" ]; then
    print_error "No Docker Compose files found!"
    exit 1
fi

echo "Found project directories:"
echo "$PROJECT_DIRS"
PROJECT_DIR=$(echo "$PROJECT_DIRS" | head -1 | xargs dirname)
print_success "Using project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"
echo ""

# 3. Git Status
print_status "📋 Git Status"
if [ -d ".git" ]; then
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo "Git status:"
    git status --porcelain
else
    print_warning "Not a git repository"
fi
echo ""

# 4. Docker Status
print_status "🐳 Docker Status"
if command -v docker &> /dev/null; then
    print_success "Docker is installed"
    echo "Docker version: $(docker --version)"
    
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
        echo "Docker Compose version: $(docker-compose --version)"
    else
        print_error "Docker Compose is not installed"
    fi
else
    print_error "Docker is not installed"
    exit 1
fi
echo ""

# 5. Check Docker Compose file
print_status "📄 Docker Compose Configuration"
if [ -f "docker-compose.prod.yml" ]; then
    print_success "docker-compose.prod.yml found"
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml found"
    COMPOSE_FILE="docker-compose.yml"
else
    print_error "No Docker Compose file found"
    exit 1
fi

echo "Services defined in $COMPOSE_FILE:"
docker-compose -f "$COMPOSE_FILE" config --services
echo ""

# 6. Container Status
print_status "📦 Container Status"
docker-compose -f "$COMPOSE_FILE" ps
echo ""

# 7. Check Environment Files
print_status "🔧 Environment Configuration"
if [ -f "backend/.env" ]; then
    print_success "backend/.env found"
    echo "Environment variables (sensitive data hidden):"
    grep -E "NODE_ENV|PORT|NEXT_PUBLIC_API_URL" backend/.env || echo "Key variables not found"
else
    print_warning "backend/.env not found"
    if [ -f "backend/.env.example" ]; then
        echo "backend/.env.example found - you may need to copy it to .env"
    fi
fi

if [ -f "frontend/.env" ]; then
    print_success "frontend/.env found"
elif [ -f "frontend/.env.prod.example" ]; then
    print_warning "frontend/.env not found, but .env.prod.example exists"
fi
echo ""

# 8. Network and Ports
print_status "🌐 Network and Ports"
echo "Open ports:"
netstat -tlnp | grep -E ":80|:443|:3000|:3001" || echo "No relevant ports found"

echo ""
echo "Docker networks:"
docker network ls
echo ""

# 9. Service Logs (last 20 lines)
print_status "📝 Service Logs (last 20 lines each)"
SERVICES=$(docker-compose -f "$COMPOSE_FILE" config --services)
for service in $SERVICES; do
    echo "--- $service logs ---"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 "$service" 2>/dev/null || echo "No logs for $service"
    echo ""
done

# 10. Health Checks
print_status "🏥 Health Checks"
echo "Testing internal connections:"

# Test backend
if curl -s -I http://localhost:3001/api/health >/dev/null 2>&1; then
    print_success "Backend (port 3001) is responding"
else
    print_error "Backend (port 3001) is not responding"
fi

# Test frontend
if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
    print_success "Frontend (port 3000) is responding"
else
    print_error "Frontend (port 3000) is not responding"
fi

# Test nginx
if curl -s -I http://localhost:80 >/dev/null 2>&1; then
    print_success "Nginx (port 80) is responding"
else
    print_error "Nginx (port 80) is not responding"
fi

# Test HTTPS
if curl -s -I https://localhost:443 >/dev/null 2>&1; then
    print_success "HTTPS (port 443) is responding"
else
    print_warning "HTTPS (port 443) is not responding"
fi
echo ""

# 11. Disk Space Check
print_status "💾 Disk Space Check"
echo "Docker system usage:"
docker system df 2>/dev/null || echo "Cannot get Docker disk usage"
echo ""

# 12. Recommendations
print_status "💡 Recommendations"
echo "Based on the diagnostic results:"

# Check if containers are running
RUNNING_CONTAINERS=$(docker-compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | wc -l)
TOTAL_SERVICES=$(docker-compose -f "$COMPOSE_FILE" config --services | wc -l)

if [ "$RUNNING_CONTAINERS" -lt "$TOTAL_SERVICES" ]; then
    print_warning "Not all services are running. Try: docker-compose -f $COMPOSE_FILE up -d"
fi

if [ ! -f "backend/.env" ]; then
    print_warning "Create backend/.env file with proper configuration"
fi

echo ""
echo "=========================================="
print_success "🎉 Diagnostic completed!"
echo "=========================================="

# 13. Quick Fix Commands
print_status "🔧 Quick Fix Commands (run if needed):"
echo "1. Pull latest changes: git pull origin main"
echo "2. Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "3. Rebuild and restart: docker-compose -f $COMPOSE_FILE down && docker-compose -f $COMPOSE_FILE up -d --build"
echo "4. View live logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "5. Check specific service: docker-compose -f $COMPOSE_FILE logs [service-name]"