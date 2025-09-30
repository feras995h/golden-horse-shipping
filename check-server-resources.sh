#!/bin/bash

# Golden Horse Shipping - Server Resource Check Script
# This script checks server resources and running services to avoid conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

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

print_header "🔍 Server Resource and Service Check"

# System Information
print_header "📊 System Information"
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo "User: $(whoami)"
echo "OS: $(uname -a)"

# Memory Usage
print_header "💾 Memory Usage"
free -h
echo ""
echo "Memory Usage Percentage:"
free | grep Mem | awk '{printf "Used: %.1f%% (%.1fGB / %.1fGB)\n", $3/$2 * 100.0, $3/1024/1024, $2/1024/1024}'

# Disk Usage
print_header "💿 Disk Usage"
df -h
echo ""
echo "Root partition usage:"
df -h / | tail -1 | awk '{print "Used: " $5 " (" $3 " / " $2 ")"}'

# CPU Usage
print_header "🖥️ CPU Usage"
echo "CPU Info:"
lscpu | grep -E "Model name|CPU\(s\)|Thread|Core"
echo ""
echo "Current CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print "CPU Usage: " $2}' | sed 's/%us,//'

# Network Ports
print_header "🌐 Network Ports in Use"
echo "Checking common ports (80, 443, 3000, 3001, 5432, 8080, 8000):"
for port in 80 443 3000 3001 5432 8080 8000; do
    if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
        process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
        print_warning "Port $port is in use by: $process"
    else
        print_success "Port $port is available"
    fi
done

# Docker Status
print_header "🐳 Docker Status"
if command -v docker > /dev/null 2>&1; then
    echo "Docker Version: $(docker --version)"
    echo "Docker Compose Version: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
    echo ""
    
    echo "Docker Service Status:"
    systemctl is-active docker 2>/dev/null || service docker status 2>/dev/null || echo "Cannot determine Docker service status"
    echo ""
    
    echo "Running Docker Containers:"
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -v "NAMES"; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_success "No Docker containers running"
    fi
    echo ""
    
    echo "Docker Resource Usage:"
    docker system df 2>/dev/null || echo "Cannot get Docker resource usage"
    echo ""
    
    echo "Docker Networks:"
    docker network ls 2>/dev/null || echo "Cannot list Docker networks"
    
else
    print_error "Docker is not installed"
fi

# Web Servers
print_header "🌐 Web Server Status"
echo "Checking for common web servers:"

# Check Nginx
if command -v nginx > /dev/null 2>&1; then
    echo "Nginx Version: $(nginx -v 2>&1)"
    if systemctl is-active nginx > /dev/null 2>&1 || service nginx status > /dev/null 2>&1; then
        print_warning "Nginx is running"
    else
        print_success "Nginx is installed but not running"
    fi
else
    print_success "Nginx is not installed"
fi

# Check Apache
if command -v apache2 > /dev/null 2>&1 || command -v httpd > /dev/null 2>&1; then
    if systemctl is-active apache2 > /dev/null 2>&1 || systemctl is-active httpd > /dev/null 2>&1; then
        print_warning "Apache is running"
    else
        print_success "Apache is installed but not running"
    fi
else
    print_success "Apache is not installed"
fi

# Database Servers
print_header "🗄️ Database Status"

# Check PostgreSQL
if command -v psql > /dev/null 2>&1; then
    echo "PostgreSQL Version: $(psql --version)"
    if systemctl is-active postgresql > /dev/null 2>&1 || service postgresql status > /dev/null 2>&1; then
        print_warning "PostgreSQL service is running"
    else
        print_success "PostgreSQL is installed but service not running"
    fi
else
    print_success "PostgreSQL is not installed"
fi

# Check MySQL
if command -v mysql > /dev/null 2>&1; then
    echo "MySQL Version: $(mysql --version)"
    if systemctl is-active mysql > /dev/null 2>&1 || service mysql status > /dev/null 2>&1; then
        print_warning "MySQL service is running"
    else
        print_success "MySQL is installed but service not running"
    fi
else
    print_success "MySQL is not installed"
fi

# Process List
print_header "🔄 Running Processes (Top 10 by CPU)"
ps aux --sort=-%cpu | head -11

print_header "🔄 Running Processes (Top 10 by Memory)"
ps aux --sort=-%mem | head -11

# Network Connections
print_header "🌐 Active Network Connections"
echo "Listening services:"
netstat -tlnp 2>/dev/null | grep LISTEN | head -20

# Check for Golden Horse specific processes
print_header "🐎 Golden Horse Application Status"
echo "Checking for Golden Horse related processes:"

if pgrep -f "golden-horse" > /dev/null; then
    print_warning "Golden Horse processes found:"
    pgrep -af "golden-horse"
else
    print_success "No Golden Horse processes running"
fi

if pgrep -f "node.*3000\|node.*3001" > /dev/null; then
    print_warning "Node.js processes on ports 3000/3001:"
    pgrep -af "node.*3000\|node.*3001"
else
    print_success "No Node.js processes on ports 3000/3001"
fi

# Resource Recommendations
print_header "💡 Resource Recommendations"

# Memory recommendation
TOTAL_MEM=$(free -m | grep Mem | awk '{print $2}')
USED_MEM=$(free -m | grep Mem | awk '{print $3}')
MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

if [ $MEM_PERCENT -gt 80 ]; then
    print_error "Memory usage is high ($MEM_PERCENT%). Consider:"
    echo "  - Stopping unnecessary services"
    echo "  - Adding more RAM"
    echo "  - Optimizing application memory usage"
elif [ $MEM_PERCENT -gt 60 ]; then
    print_warning "Memory usage is moderate ($MEM_PERCENT%). Monitor closely."
else
    print_success "Memory usage is acceptable ($MEM_PERCENT%)"
fi

# Disk recommendation
DISK_PERCENT=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_PERCENT -gt 80 ]; then
    print_error "Disk usage is high ($DISK_PERCENT%). Consider:"
    echo "  - Cleaning up old files"
    echo "  - Docker system prune"
    echo "  - Adding more storage"
elif [ $DISK_PERCENT -gt 60 ]; then
    print_warning "Disk usage is moderate ($DISK_PERCENT%). Monitor closely."
else
    print_success "Disk usage is acceptable ($DISK_PERCENT%)"
fi

# Final Summary
print_header "📋 Summary"
echo "Server Status Summary:"
echo "- Memory: $MEM_PERCENT% used"
echo "- Disk: $DISK_PERCENT% used"
echo "- Docker: $(command -v docker > /dev/null && echo 'Installed' || echo 'Not installed')"
echo "- Running containers: $(docker ps -q 2>/dev/null | wc -l || echo '0')"

# Port conflict check
CONFLICTS=0
for port in 80 3000 3001 5432; do
    if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
        CONFLICTS=$((CONFLICTS + 1))
    fi
done

if [ $CONFLICTS -gt 0 ]; then
    print_warning "Found $CONFLICTS potential port conflicts"
    echo "Review the port usage above before deploying"
else
    print_success "No port conflicts detected"
fi

print_header "✅ Resource Check Complete"
echo "Review the information above before proceeding with deployment."