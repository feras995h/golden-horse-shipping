@echo off
echo ========================================
echo Golden Horse Shipping - VPS Deployment
echo ========================================
echo.

echo This script will help you deploy the updated application to your VPS.
echo.

echo Step 1: Connect to your VPS
echo ----------------------------
echo Please connect to your VPS using SSH:
echo.
echo ssh root@72.60.92.146
echo.
echo (Enter your VPS password when prompted)
echo.

echo Step 2: Run the deployment script
echo ----------------------------------
echo Once connected to your VPS, run ONE of these options:
echo.
echo OPTION A - Download and run the script:
echo curl -o deploy-to-vps.sh https://raw.githubusercontent.com/your-repo/main/deploy-to-vps.sh
echo chmod +x deploy-to-vps.sh
echo ./deploy-to-vps.sh
echo.
echo OPTION B - Copy and paste the script:
echo 1. Create the script file:
echo    nano deploy-to-vps.sh
echo.
echo 2. Copy the entire content from 'deploy-to-vps.sh' file
echo    and paste it into the nano editor
echo.
echo 3. Save and exit (Ctrl+X, then Y, then Enter)
echo.
echo 4. Make it executable and run:
echo    chmod +x deploy-to-vps.sh
echo    ./deploy-to-vps.sh
echo.

echo Step 3: What the script will do
echo --------------------------------
echo The deployment script will:
echo - Pull the latest code from Git
echo - Update environment variables for production
echo - Stop existing Docker containers
echo - Clean Docker system
echo - Rebuild all Docker images
echo - Start all services (PostgreSQL, Backend, Frontend, Nginx)
echo - Perform health checks
echo - Display status report
echo.

echo Expected Results:
echo ------------------
echo After successful deployment:
echo - Main Application: http://72.60.92.146
echo - Backend API: http://72.60.92.146:3001/api
echo - Frontend: http://72.60.92.146:3000
echo - Health Check: http://72.60.92.146/health
echo.
echo Login Credentials:
echo - Username: admin
echo - Password: admin123
echo.

echo Troubleshooting:
echo ----------------
echo If you encounter issues on the VPS, use these commands:
echo.
echo View logs:
echo   docker-compose -f docker-compose.prod.yml logs
echo.
echo Check container status:
echo   docker-compose -f docker-compose.prod.yml ps
echo.
echo Restart services:
echo   docker-compose -f docker-compose.prod.yml restart
echo.
echo Clean restart:
echo   docker-compose -f docker-compose.prod.yml down
echo   docker-compose -f docker-compose.prod.yml up -d
echo.

echo ========================================
echo Ready to deploy? Connect to your VPS now!
echo ========================================
pause