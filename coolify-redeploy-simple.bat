@echo off
echo ========================================
echo        Coolify Redeployment Guide
echo ========================================
echo.

echo Steps for Quiet Redeployment:
echo.

echo 1. Ensure all changes are saved to GitHub
echo.

echo 2. Access your Coolify dashboard
echo.

echo 3. Find your project (Golden Horse Logistics)
echo.

echo 4. Click "Deploy" or "Redeploy"
echo.

echo 5. Wait for deployment completion
echo.

echo ========================================
echo           Current Project Information
echo ========================================
echo.

echo Detected Coolify Configuration:
echo.
echo    - Dockerfile: Available
echo    - Health Check: /api/health
echo    - Port: 3000
echo    - Environment: Production
echo    - Database: PostgreSQL (Neon)
echo.

echo Expected URLs after deployment:
echo.
echo    - Main App: https://[your-coolify-domain]
echo    - API Health: https://[your-coolify-domain]/api/health
echo.

echo Default Login Credentials:
echo.
echo    - Email: admin@goldenhorse.com
echo    - Password: admin123
echo.

echo ========================================
echo              Important Tips
echo ========================================
echo.

echo Make sure to:
echo.
echo    - Save all changes to Git before deployment
echo    - Monitor deployment logs in Coolify
echo    - Test the application after deployment
echo.

echo In case of issues:
echo.
echo    - Check Coolify logs
echo    - Verify environment variables
echo    - Review database configuration
echo.

echo ========================================
echo            Troubleshooting Commands
echo ========================================
echo.

echo Useful Coolify commands:
echo.
echo    - View Logs
echo    - Restart Application
echo    - Check Health Status
echo    - Environment Settings
echo.

echo For technical support:
echo.
echo    - Check official Coolify documentation
echo    - Check service status
echo.

echo ========================================
echo              Guide Complete
echo ========================================
echo.

echo Press any key to exit...
pause >nul