@echo off
REM Quick Healthcheck Fix Script for Golden Horse Shipping (Windows)
REM This script fixes the Docker healthcheck issue and redeploys the application

echo 🔧 Golden Horse Shipping - Healthcheck Fix Script (Windows)
echo ===========================================================

REM Check if we're in the right directory
if not exist "Dockerfile" (
    echo ❌ Error: Dockerfile not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo 📋 Current status check...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check current container status
set CONTAINER_NAME=golden-horse-app
docker ps -a --format "table {{.Names}}" | findstr /r "^%CONTAINER_NAME%$" >nul
if not errorlevel 1 (
    echo 📦 Found existing container: %CONTAINER_NAME%
    
    REM Stop and remove existing container
    echo 🛑 Stopping existing container...
    docker stop %CONTAINER_NAME% >nul 2>&1
    
    echo 🗑️ Removing existing container...
    docker rm %CONTAINER_NAME% >nul 2>&1
) else (
    echo 📦 No existing container found
)

REM Build new image with healthcheck fix
echo 🔨 Building new Docker image with healthcheck fix...
docker build -t golden-horse-shipping .
if errorlevel 1 (
    echo ❌ Error: Failed to build Docker image
    pause
    exit /b 1
)

echo ✅ Docker image built successfully

REM Get database URL from environment or prompt user
if "%DATABASE_URL%"=="" (
    echo ⚠️ DATABASE_URL not set in environment
    set /p DATABASE_URL="Please enter your database URL: "
)

REM Run new container
echo 🚀 Starting new container with healthcheck fix...
docker run -d --name %CONTAINER_NAME% -p 3000:3000 -e NODE_ENV=production -e DATABASE_URL="%DATABASE_URL%" -e BACKEND_PORT=3001 -e FRONTEND_PORT=3000 --restart unless-stopped golden-horse-shipping
if errorlevel 1 (
    echo ❌ Error: Failed to start container
    pause
    exit /b 1
)

echo ✅ Container started successfully

REM Wait for application to start
echo ⏳ Waiting for application to start (60 seconds)...
timeout /t 60 /nobreak >nul

REM Check container health
echo 🔍 Checking container health...
for /f "tokens=*" %%i in ('docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME% 2^>nul') do set HEALTH_STATUS=%%i

if "%HEALTH_STATUS%"=="healthy" (
    echo ✅ Container is healthy!
) else if "%HEALTH_STATUS%"=="starting" (
    echo ⏳ Container is still starting up...
    echo 💡 Check status in a few minutes with: docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME%
) else (
    echo ⚠️ Container health status: %HEALTH_STATUS%
)

REM Test API endpoint
echo 🧪 Testing API health endpoint...
curl -f -s http://localhost:3001/api/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ API health endpoint is responding
    echo 🌐 Application URLs:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:3001/api
    echo    Health Check: http://localhost:3001/api/health
) else (
    echo ⚠️ API health endpoint not responding yet
    echo 💡 This is normal during startup. Check again in a few minutes.
)

REM Show container logs
echo 📋 Recent container logs:
docker logs --tail=20 %CONTAINER_NAME%

echo.
echo 🎉 Healthcheck fix deployment completed!
echo.
echo 📊 Monitoring commands:
echo    Check container status: docker ps
echo    Check health status: docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME%
echo    View logs: docker logs -f %CONTAINER_NAME%
echo    Test API: curl http://localhost:3001/api/health
echo.
echo 🆘 If issues persist, check the logs and ensure:
echo    1. Database connection is working
echo    2. All environment variables are set correctly
echo    3. Ports 3000 and 3001 are not used by other applications

pause