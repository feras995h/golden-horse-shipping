@echo off
setlocal enabledelayedexpansion

REM Golden Horse Shipping - Final Healthcheck Fix Script (Windows)
REM سكريبت الإصلاح النهائي لفحص الصحة (ويندوز)

echo 🚢 Golden Horse Shipping - Final Healthcheck Fix
echo ================================================

REM Check if Dockerfile exists
if not exist "Dockerfile" (
    echo ❌ Error: Dockerfile not found in current directory
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running
    pause
    exit /b 1
)

REM Stop and remove existing container
echo 🛑 Stopping existing containers...
docker stop golden-horse-shipping >nul 2>&1
docker rm golden-horse-shipping >nul 2>&1

REM Build new image
echo 🔨 Building Docker image with final healthcheck fix...
docker build -t golden-horse-shipping:latest .
if errorlevel 1 (
    echo ❌ Error: Failed to build Docker image
    pause
    exit /b 1
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ⚠️  DATABASE_URL not set in environment
    set /p DATABASE_URL=Enter your DATABASE_URL: 
)

REM Run container with enhanced configuration
echo 🚀 Starting container with final healthcheck configuration...
docker run -d --name golden-horse-shipping --restart unless-stopped -p 3000:3000 -p 3001:3001 -e DATABASE_URL="%DATABASE_URL%" -e NODE_ENV=production -e PORT=3001 -e FRONTEND_PORT=3000 -e BACKEND_PORT=3001 golden-horse-shipping:latest

if errorlevel 1 (
    echo ❌ Error: Failed to start container
    pause
    exit /b 1
)

echo ⏳ Container started. Waiting for services to initialize...
echo    This may take up to 2 minutes due to enhanced startup sequence...

REM Wait for container to be ready
timeout /t 30 /nobreak >nul

REM Show container status
echo 📊 Container Status:
docker ps --filter name=golden-horse-shipping --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

REM Wait for healthcheck to start
echo ⏳ Waiting for healthcheck to begin (120 seconds startup period)...
timeout /t 90 /nobreak >nul

REM Monitor healthcheck status
echo 🔍 Monitoring healthcheck status...
for /l %%i in (1,1,10) do (
    echo Check %%i/10:
    
    REM Get container health status
    for /f "delims=" %%a in ('docker inspect --format="{{.State.Health.Status}}" golden-horse-shipping 2^>nul') do set HEALTH_STATUS=%%a
    if "!HEALTH_STATUS!"=="" set HEALTH_STATUS=no-healthcheck
    echo   Health Status: !HEALTH_STATUS!
    
    REM Try manual health check
    echo   Manual Check:
    curl -s -f http://localhost:3001/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo     ✅ API Health endpoint responding
        for /f "delims=" %%b in ('curl -s http://localhost:3001/api/health 2^>nul') do echo     Response: %%b
    ) else (
        echo     ❌ API Health endpoint not responding
    )
    
    REM Check if healthy
    if "!HEALTH_STATUS!"=="healthy" (
        echo 🎉 Container is healthy!
        goto :healthy
    )
    
    if %%i==10 (
        echo ⚠️  Healthcheck still not passing after extended wait
        echo 📋 Showing recent container logs for diagnosis:
        docker logs --tail 20 golden-horse-shipping
        
        echo.
        echo 🔧 Troubleshooting Commands:
        echo   View logs: docker logs -f golden-horse-shipping
        echo   Check health: docker inspect --format="{{json .State.Health}}" golden-horse-shipping
        echo   Test API: curl http://localhost:3001/api/health
        echo   Container shell: docker exec -it golden-horse-shipping sh
    ) else (
        echo   Waiting 30 seconds before next check...
        timeout /t 30 /nobreak >nul
    )
)

:healthy
echo.
echo 🌐 Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001/api
echo   Health Check: http://localhost:3001/api/health

echo.
echo 📋 Useful Commands:
echo   Monitor logs: docker logs -f golden-horse-shipping
echo   Check status: docker ps
echo   Stop container: docker stop golden-horse-shipping
echo   Restart container: docker restart golden-horse-shipping

echo.
echo ✅ Final healthcheck fix deployment completed!
pause