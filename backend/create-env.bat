@echo off
echo إنشاء ملف .env...

(
echo # Database Configuration
echo DATABASE_URL=sqlite:./database.sqlite
echo.
echo # JWT Configuration
echo JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
echo JWT_EXPIRES_IN=7d
echo.
echo # ShipsGo API Configuration
echo # احصل على API key من https://shipsgo.com
echo SHIPSGO_API_URL=https://api.shipsgo.com/v1
echo SHIPSGO_API_KEY=your-shipsgo-api-key-here
echo SHIPSGO_FALLBACK_TO_MOCK=true
echo.
echo # Rate Limiting
echo SHIPSGO_RATE_LIMIT=100
echo.
echo # Frontend URL
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Server Configuration
echo PORT=3001
echo NODE_ENV=development
) > .env

echo تم إنشاء ملف .env بنجاح!
echo.
echo الخطوات التالية:
echo 1. افتح ملف .env
echo 2. استبدل "your-shipsgo-api-key-here" بمفتاح API الحقيقي من ShipsGo
echo 3. أو اترك SHIPSGO_FALLBACK_TO_MOCK=true للاختبار
echo 4. أعد تشغيل الخادم
echo.
echo للاختبار السريع: اترك SHIPSGO_FALLBACK_TO_MOCK=true
echo للإنتاج: احصل على API key حقيقي من https://shipsgo.com
echo.
pause
