@echo off
echo ========================================
echo    VPS Deployment Fix Instructions
echo ========================================
echo.
echo This script will help you fix the deployment issues on your VPS.
echo.
echo SSH Connection Details:
echo   Host: 72.60.92.146
echo   User: root
echo   Password: Feras6476095#
echo.
echo ========================================
echo Step 1: Connect to VPS
echo ========================================
echo Run this command to connect to your VPS:
echo   ssh root@72.60.92.146
echo.
echo When prompted, enter password: Feras6476095#
echo.
echo ========================================
echo Step 2: Upload and Run Fix Script
echo ========================================
echo.
echo Option A - Copy and Paste Method:
echo 1. After connecting to VPS, create the script:
echo    nano fix-vps-deployment.sh
echo.
echo 2. Copy the content from 'fix-vps-deployment.sh' file
echo    and paste it into the nano editor
echo.
echo 3. Save and exit: Ctrl+X, then Y, then Enter
echo.
echo 4. Make it executable:
echo    chmod +x fix-vps-deployment.sh
echo.
echo 5. Run the script:
echo    ./fix-vps-deployment.sh
echo.
echo ========================================
echo Option B - Download Method:
echo ========================================
echo 1. Download the script directly on VPS:
echo    wget https://raw.githubusercontent.com/your-repo/main/fix-vps-deployment.sh
echo.
echo 2. Make it executable:
echo    chmod +x fix-vps-deployment.sh
echo.
echo 3. Run the script:
echo    ./fix-vps-deployment.sh
echo.
echo ========================================
echo What the script will do:
echo ========================================
echo - Pull latest code changes
echo - Update environment variables
echo - Stop and rebuild Docker containers
echo - Start all services
echo - Test all endpoints
echo - Show status report
echo.
echo ========================================
echo After running the script:
echo ========================================
echo Your application should be available at:
echo   - Main Site: http://72.60.92.146
echo   - Frontend: http://72.60.92.146:3000
echo   - Backend API: http://72.60.92.146:3001/api
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo If you encounter issues, run these commands on VPS:
echo   - Check container status: docker-compose -f docker-compose.prod.yml ps
echo   - View logs: docker-compose -f docker-compose.prod.yml logs
echo   - Restart services: docker-compose -f docker-compose.prod.yml restart
echo.
pause