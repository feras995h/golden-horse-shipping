@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM Golden Horse Shipping - Unified Deployment Script (Windows)
REM =============================================================================
REM This script handles all deployment scenarios on Windows:
REM - Single app deployment (Coolify, Railway, etc.)
REM - Full stack VPS deployment with PostgreSQL
REM - Development environment setup
REM - Production deployment with Nginx
REM =============================================================================

set "DEPLOYMENT_TYPE="
set "COMPOSE_PROFILES="
set "SKIP_BUILD=false"
set "SKIP_TESTS=false"
set "VERBOSE=false"
set "DRY_RUN=false"
set "DOCKER_COMPOSE_CMD=docker-compose"

REM Colors (limited support in Windows)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "PURPLE=[95m"
set "CYAN=[96m"
set "NC=[0m"

REM Check if docker-compose or docker compose is available
docker-compose --version >nul 2>&1
if !errorlevel! neq 0 (
    docker compose version >nul 2>&1
    if !errorlevel! neq 0 (
        echo %RED%[ERROR]%NC% Docker Compose is not installed
        exit /b 1
    ) else (
        set "DOCKER_COMPOSE_CMD=docker compose"
    )
)

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_parsed
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
if "%~1"=="-v" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="-n" (
    set "DRY_RUN=true"
    shift
    goto :parse_args
)
if "%~1"=="--dry-run" (
    set "DRY_RUN=true"
    shift
    goto :parse_args
)
if "%~1"=="--skip-build" (
    set "SKIP_BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="--skip-tests" (
    set "SKIP_TESTS=true"
    shift
    goto :parse_args
)
if "%~1"=="single-app" (
    set "DEPLOYMENT_TYPE=single-app"
    shift
    goto :parse_args
)
if "%~1"=="coolify" (
    set "DEPLOYMENT_TYPE=single-app"
    shift
    goto :parse_args
)
if "%~1"=="full-stack" (
    set "DEPLOYMENT_TYPE=full-stack"
    shift
    goto :parse_args
)
if "%~1"=="dev" (
    set "DEPLOYMENT_TYPE=full-stack"
    shift
    goto :parse_args
)
if "%~1"=="development" (
    set "DEPLOYMENT_TYPE=full-stack"
    shift
    goto :parse_args
)
if "%~1"=="production" (
    set "DEPLOYMENT_TYPE=production"
    shift
    goto :parse_args
)
if "%~1"=="vps" (
    set "DEPLOYMENT_TYPE=production"
    shift
    goto :parse_args
)
if "%~1"=="prod" (
    set "DEPLOYMENT_TYPE=production"
    shift
    goto :parse_args
)
echo %RED%[ERROR]%NC% Unknown option: %~1
goto :show_help

:args_parsed

REM Show help
:show_help
echo.
echo %PURPLE%Golden Horse Shipping - Unified Deployment Script (Windows)%NC%
echo.
echo USAGE:
echo     deploy.bat [OPTIONS] [DEPLOYMENT_TYPE]
echo.
echo DEPLOYMENT TYPES:
echo     single-app      Single application deployment (Coolify, Railway)
echo     full-stack      Full stack with all services (development)
echo     production      Production deployment with Nginx (VPS)
echo     vps            Alias for production
echo     dev            Development environment
echo     coolify        Optimized for Coolify platform
echo.
echo OPTIONS:
echo     -h, --help          Show this help message
echo     -v, --verbose       Enable verbose output
echo     -n, --dry-run       Show what would be done without executing
echo     --skip-build        Skip Docker build step
echo     --skip-tests        Skip health checks
echo.
echo EXAMPLES:
echo     deploy.bat production          # Deploy to production VPS
echo     deploy.bat single-app          # Deploy single app (Coolify)
echo     deploy.bat dev                 # Start development environment
echo     deploy.bat --dry-run vps       # Preview VPS deployment
echo     deploy.bat --verbose production # Verbose production deployment
echo.
echo ENVIRONMENT:
echo     Create a .env file based on .env.example and configure your settings.
echo     The script will automatically detect and use appropriate profiles.
echo.
if "%~1"=="-h" exit /b 0
if "%~1"=="--help" exit /b 0
exit /b 1

REM Detect deployment type
:detect_deployment_type
if not "%DEPLOYMENT_TYPE%"=="" goto :deployment_detected

echo %BLUE%[INFO]%NC% Auto-detecting deployment type...

REM Check for Coolify environment
if exist ".coolify.yml" (
    set "DEPLOYMENT_TYPE=single-app"
    echo %BLUE%[INFO]%NC% Detected Coolify environment
    goto :deployment_detected
)

REM Check for Railway environment
if exist "railway.json" (
    set "DEPLOYMENT_TYPE=single-app"
    echo %BLUE%[INFO]%NC% Detected Railway environment
    goto :deployment_detected
)

REM Check for VPS environment
if exist ".env" (
    findstr /C:"72.60.92.146" .env >nul 2>&1
    if !errorlevel! equ 0 (
        set "DEPLOYMENT_TYPE=production"
        echo %BLUE%[INFO]%NC% Detected VPS environment
        goto :deployment_detected
    )
)

REM Default to development
set "DEPLOYMENT_TYPE=full-stack"
echo %BLUE%[INFO]%NC% Defaulting to full-stack development

:deployment_detected

REM Set compose profiles
:set_compose_profiles
if not "%COMPOSE_PROFILES%"=="" goto :profiles_set

if "%DEPLOYMENT_TYPE%"=="single-app" (
    set "COMPOSE_PROFILES=single-app,coolify"
) else if "%DEPLOYMENT_TYPE%"=="full-stack" (
    set "COMPOSE_PROFILES=full-stack"
) else if "%DEPLOYMENT_TYPE%"=="production" (
    set "COMPOSE_PROFILES=production,full-stack"
) else (
    set "COMPOSE_PROFILES=full-stack"
)

:profiles_set

REM Check prerequisites
:check_prerequisites
echo.
echo %PURPLE%=== Checking Prerequisites ===%NC%
echo.

REM Check Docker
docker --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%[ERROR]%NC% Docker is not installed
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Docker is available

REM Check Docker Compose (already checked above)
echo %GREEN%[SUCCESS]%NC% Docker Compose is available

REM Check .env file
if not exist ".env" (
    echo %YELLOW%[WARNING]%NC% .env file not found
    if exist ".env.example" (
        echo %BLUE%[INFO]%NC% Creating .env from .env.example
        copy ".env.example" ".env" >nul
        echo %YELLOW%[WARNING]%NC% Please review and update .env file before continuing
        if "%DRY_RUN%"=="false" (
            pause
        )
    ) else (
        echo %RED%[ERROR]%NC% .env.example not found. Cannot create .env file
        exit /b 1
    )
)
echo %GREEN%[SUCCESS]%NC% .env file exists

REM Check required directories
if "%DEPLOYMENT_TYPE%"=="single-app" (
    if not exist "Dockerfile" (
        echo %RED%[ERROR]%NC% Dockerfile not found for single-app deployment
        exit /b 1
    )
) else (
    if not exist "backend" (
        echo %RED%[ERROR]%NC% backend/ directory required for full-stack deployment
        exit /b 1
    )
    if not exist "frontend" (
        echo %RED%[ERROR]%NC% frontend/ directory required for full-stack deployment
        exit /b 1
    )
    if not exist "backend\Dockerfile" (
        echo %RED%[ERROR]%NC% backend/Dockerfile not found
        exit /b 1
    )
    if not exist "frontend\Dockerfile" (
        echo %RED%[ERROR]%NC% frontend/Dockerfile not found
        exit /b 1
    )
)

REM Main deployment
:main_deployment
echo.
echo %PURPLE%=== Golden Horse Shipping - Unified Deployment ===%NC%
echo.

echo %BLUE%[INFO]%NC% Deployment Type: %DEPLOYMENT_TYPE%
echo %BLUE%[INFO]%NC% Compose Profiles: %COMPOSE_PROFILES%

if "%DRY_RUN%"=="true" (
    echo %YELLOW%[WARNING]%NC% DRY RUN MODE - No actual changes will be made
)

REM Stop existing services
echo.
echo %PURPLE%=== Stopping Existing Services ===%NC%
echo.

if "%VERBOSE%"=="true" echo Command: %DOCKER_COMPOSE_CMD% --profile "*" down --remove-orphans
if "%DRY_RUN%"=="false" (
    %DOCKER_COMPOSE_CMD% --profile "*" down --remove-orphans
)

REM Build services
if "%SKIP_BUILD%"=="true" (
    echo %BLUE%[INFO]%NC% Skipping build step
) else (
    echo.
    echo %PURPLE%=== Building Services ===%NC%
    echo.
    
    if "%DEPLOYMENT_TYPE%"=="single-app" (
        if "%VERBOSE%"=="true" echo Command: %DOCKER_COMPOSE_CMD% build --no-cache app
        if "%DRY_RUN%"=="false" (
            %DOCKER_COMPOSE_CMD% build --no-cache app
        )
    ) else (
        if "%VERBOSE%"=="true" echo Command: %DOCKER_COMPOSE_CMD% build --no-cache --parallel
        if "%DRY_RUN%"=="false" (
            %DOCKER_COMPOSE_CMD% build --no-cache --parallel
        )
    )
)

REM Start services
echo.
echo %PURPLE%=== Starting Services ===%NC%
echo.

set "COMPOSE_PROFILES=%COMPOSE_PROFILES%"
if "%VERBOSE%"=="true" echo Command: %DOCKER_COMPOSE_CMD% up -d
if "%DRY_RUN%"=="false" (
    %DOCKER_COMPOSE_CMD% up -d
    timeout /t 5 /nobreak >nul
)

REM Health checks
if "%SKIP_TESTS%"=="true" (
    echo %BLUE%[INFO]%NC% Skipping health checks
) else (
    echo.
    echo %PURPLE%=== Running Health Checks ===%NC%
    echo.
    
    if "%DRY_RUN%"=="true" (
        echo %BLUE%[INFO]%NC% Would run health checks for active services
    ) else (
        echo %BLUE%[INFO]%NC% Waiting for services to be ready...
        timeout /t 10 /nobreak >nul
        echo %GREEN%[SUCCESS]%NC% Services should be ready
    )
)

REM Show status
echo.
echo %PURPLE%=== Deployment Status ===%NC%
echo.

if "%DRY_RUN%"=="true" (
    echo %BLUE%[INFO]%NC% Dry run completed. No actual deployment performed.
) else (
    %DOCKER_COMPOSE_CMD% ps
    
    echo.
    echo %PURPLE%=== Access Information ===%NC%
    echo.
    
    if "%DEPLOYMENT_TYPE%"=="single-app" (
        echo %GREEN%[SUCCESS]%NC% Application: http://localhost:3000
        echo %GREEN%[SUCCESS]%NC% API Health: http://localhost:3000/api/health
    ) else (
        echo %GREEN%[SUCCESS]%NC% Frontend: http://localhost:3000
        echo %GREEN%[SUCCESS]%NC% Backend API: http://localhost:3001/api
        echo %GREEN%[SUCCESS]%NC% API Health: http://localhost:3001/api/health
        if "%DEPLOYMENT_TYPE%"=="production" (
            echo %GREEN%[SUCCESS]%NC% Nginx Proxy: http://localhost:80
        )
    )
    
    echo.
    echo %PURPLE%=== Useful Commands ===%NC%
    echo View logs:     %DOCKER_COMPOSE_CMD% logs -f
    echo Stop services: %DOCKER_COMPOSE_CMD% down
    echo Restart:       %DOCKER_COMPOSE_CMD% restart
    echo Status:        %DOCKER_COMPOSE_CMD% ps
)

echo.
echo %GREEN%[SUCCESS]%NC% Deployment completed successfully!

if "%DEPLOYMENT_TYPE%"=="production" (
    echo %BLUE%[INFO]%NC% For production monitoring, check logs regularly:
    echo   %DOCKER_COMPOSE_CMD% logs -f
)

goto :end

REM Start main execution
call :detect_deployment_type
call :set_compose_profiles
call :check_prerequisites
call :main_deployment

:end
endlocal