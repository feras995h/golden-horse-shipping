#!/bin/bash

# =============================================================================
# Golden Horse Shipping - Unified Deployment Script
# =============================================================================
# This script handles all deployment scenarios:
# - Single app deployment (Coolify, Railway, etc.)
# - Full stack VPS deployment with PostgreSQL
# - Development environment setup
# - Production deployment with Nginx
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}\n"
}

# Default values
DEPLOYMENT_TYPE=""
COMPOSE_PROFILES=""
SKIP_BUILD=false
SKIP_TESTS=false
VERBOSE=false
DRY_RUN=false

# Help function
show_help() {
    cat << EOF
Golden Horse Shipping - Unified Deployment Script

USAGE:
    ./deploy.sh [OPTIONS] [DEPLOYMENT_TYPE]

DEPLOYMENT TYPES:
    single-app      Single application deployment (Coolify, Railway)
    full-stack      Full stack with all services (development)
    production      Production deployment with Nginx (VPS)
    vps            Alias for production
    dev            Development environment
    coolify        Optimized for Coolify platform

OPTIONS:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose output
    -n, --dry-run       Show what would be done without executing
    --skip-build        Skip Docker build step
    --skip-tests        Skip health checks
    --profiles PROFILES Override compose profiles

EXAMPLES:
    ./deploy.sh production          # Deploy to production VPS
    ./deploy.sh single-app          # Deploy single app (Coolify)
    ./deploy.sh dev                 # Start development environment
    ./deploy.sh --dry-run vps       # Preview VPS deployment
    ./deploy.sh --verbose production # Verbose production deployment

ENVIRONMENT:
    Create a .env file based on .env.example and configure your settings.
    The script will automatically detect and use appropriate profiles.

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -n|--dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --profiles)
                COMPOSE_PROFILES="$2"
                shift 2
                ;;
            single-app|coolify)
                DEPLOYMENT_TYPE="single-app"
                shift
                ;;
            full-stack|dev|development)
                DEPLOYMENT_TYPE="full-stack"
                shift
                ;;
            production|vps|prod)
                DEPLOYMENT_TYPE="production"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Detect deployment type automatically
detect_deployment_type() {
    if [[ -n "$DEPLOYMENT_TYPE" ]]; then
        return
    fi

    log_info "Auto-detecting deployment type..."

    # Check for Coolify environment
    if [[ -n "$COOLIFY_APP_ID" ]] || [[ -f ".coolify.yml" ]]; then
        DEPLOYMENT_TYPE="single-app"
        log_info "Detected Coolify environment"
        return
    fi

    # Check for Railway environment
    if [[ -n "$RAILWAY_ENVIRONMENT" ]] || [[ -f "railway.json" ]]; then
        DEPLOYMENT_TYPE="single-app"
        log_info "Detected Railway environment"
        return
    fi

    # Check for VPS environment (look for specific IP or domain)
    if [[ -f ".env" ]] && grep -q "72.60.92.146" .env; then
        DEPLOYMENT_TYPE="production"
        log_info "Detected VPS environment"
        return
    fi

    # Default to development
    DEPLOYMENT_TYPE="full-stack"
    log_info "Defaulting to full-stack development"
}

# Set compose profiles based on deployment type
set_compose_profiles() {
    if [[ -n "$COMPOSE_PROFILES" ]]; then
        return
    fi

    case "$DEPLOYMENT_TYPE" in
        single-app)
            COMPOSE_PROFILES="single-app,coolify"
            ;;
        full-stack)
            COMPOSE_PROFILES="full-stack"
            ;;
        production)
            COMPOSE_PROFILES="production,full-stack"
            ;;
        *)
            COMPOSE_PROFILES="full-stack"
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker is available: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
        log_success "Docker Compose is available: $(docker-compose --version)"
    else
        DOCKER_COMPOSE_CMD="docker compose"
        log_success "Docker Compose is available: $(docker compose version)"
    fi

    # Check .env file
    if [[ ! -f ".env" ]]; then
        log_warning ".env file not found"
        if [[ -f ".env.example" ]]; then
            log_info "Creating .env from .env.example"
            cp .env.example .env
            log_warning "Please review and update .env file before continuing"
            if [[ "$DRY_RUN" == "false" ]]; then
                read -p "Press Enter to continue after updating .env file..."
            fi
        else
            log_error ".env.example not found. Cannot create .env file"
            exit 1
        fi
    fi
    log_success ".env file exists"

    # Check required directories
    case "$DEPLOYMENT_TYPE" in
        single-app)
            if [[ ! -f "Dockerfile" ]]; then
                log_error "Dockerfile not found for single-app deployment"
                exit 1
            fi
            ;;
        full-stack|production)
            if [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
                log_error "backend/ and frontend/ directories required for full-stack deployment"
                exit 1
            fi
            if [[ ! -f "backend/Dockerfile" ]] || [[ ! -f "frontend/Dockerfile" ]]; then
                log_error "Dockerfiles not found in backend/ and frontend/ directories"
                exit 1
            fi
            ;;
    esac
}

# Execute command with dry-run support
execute_cmd() {
    local cmd="$1"
    local description="$2"
    
    if [[ "$VERBOSE" == "true" ]] || [[ "$DRY_RUN" == "true" ]]; then
        log_info "$description"
        echo "Command: $cmd"
    fi
    
    if [[ "$DRY_RUN" == "false" ]]; then
        eval "$cmd"
    fi
}

# Stop existing services
stop_services() {
    log_header "Stopping Existing Services"
    
    execute_cmd "$DOCKER_COMPOSE_CMD --profile '*' down --remove-orphans" "Stopping all services"
    
    if [[ "$VERBOSE" == "true" ]]; then
        execute_cmd "docker system prune -f" "Cleaning up unused Docker resources"
    fi
}

# Build services
build_services() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        log_info "Skipping build step"
        return
    fi

    log_header "Building Services"
    
    case "$DEPLOYMENT_TYPE" in
        single-app)
            execute_cmd "$DOCKER_COMPOSE_CMD build --no-cache app" "Building single application"
            ;;
        full-stack|production)
            execute_cmd "$DOCKER_COMPOSE_CMD build --no-cache --parallel" "Building all services"
            ;;
    esac
}

# Start services
start_services() {
    log_header "Starting Services"
    
    export COMPOSE_PROFILES="$COMPOSE_PROFILES"
    
    execute_cmd "$DOCKER_COMPOSE_CMD up -d" "Starting services with profiles: $COMPOSE_PROFILES"
    
    # Wait a moment for services to start
    if [[ "$DRY_RUN" == "false" ]]; then
        sleep 5
    fi
}

# Health checks
run_health_checks() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_info "Skipping health checks"
        return
    fi

    log_header "Running Health Checks"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would run health checks for active services"
        return
    fi
    
    # Wait for services to be ready
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        local all_healthy=true
        
        # Check each service
        case "$DEPLOYMENT_TYPE" in
            single-app)
                if ! curl -f http://localhost:${PORT:-3000}/api/health &> /dev/null; then
                    all_healthy=false
                fi
                ;;
            full-stack|production)
                if ! curl -f http://localhost:${BACKEND_PORT:-3001}/api/health &> /dev/null; then
                    all_healthy=false
                fi
                if ! curl -f http://localhost:${FRONTEND_PORT:-3000} &> /dev/null; then
                    all_healthy=false
                fi
                ;;
        esac
        
        if [[ "$all_healthy" == "true" ]]; then
            log_success "All services are healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_warning "Some services may not be fully ready yet"
            break
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Show deployment status
show_status() {
    log_header "Deployment Status"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Dry run completed. No actual deployment performed."
        return
    fi
    
    execute_cmd "$DOCKER_COMPOSE_CMD ps" "Service status"
    
    log_header "Access Information"
    
    case "$DEPLOYMENT_TYPE" in
        single-app)
            log_success "Application: http://localhost:${PORT:-3000}"
            log_success "API Health: http://localhost:${PORT:-3000}/api/health"
            ;;
        full-stack|production)
            log_success "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
            log_success "Backend API: http://localhost:${BACKEND_PORT:-3001}/api"
            log_success "API Health: http://localhost:${BACKEND_PORT:-3001}/api/health"
            if [[ "$DEPLOYMENT_TYPE" == "production" ]]; then
                log_success "Nginx Proxy: http://localhost:${HTTP_PORT:-80}"
            fi
            ;;
    esac
    
    log_header "Useful Commands"
    echo "View logs:     $DOCKER_COMPOSE_CMD logs -f"
    echo "Stop services: $DOCKER_COMPOSE_CMD down"
    echo "Restart:       $DOCKER_COMPOSE_CMD restart"
    echo "Status:        $DOCKER_COMPOSE_CMD ps"
}

# Cleanup on error
cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    if [[ "$DRY_RUN" == "false" ]]; then
        $DOCKER_COMPOSE_CMD down --remove-orphans || true
    fi
    exit 1
}

# Main deployment function
main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    log_header "Golden Horse Shipping - Unified Deployment"
    
    # Parse arguments
    parse_args "$@"
    
    # Detect deployment type if not specified
    detect_deployment_type
    
    # Set compose profiles
    set_compose_profiles
    
    log_info "Deployment Type: $DEPLOYMENT_TYPE"
    log_info "Compose Profiles: $COMPOSE_PROFILES"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Run deployment steps
    check_prerequisites
    stop_services
    build_services
    start_services
    run_health_checks
    show_status
    
    log_success "Deployment completed successfully!"
    
    if [[ "$DEPLOYMENT_TYPE" == "production" ]]; then
        log_info "For production monitoring, check logs regularly:"
        echo "  $DOCKER_COMPOSE_CMD logs -f"
    fi
}

# Run main function with all arguments
main "$@"