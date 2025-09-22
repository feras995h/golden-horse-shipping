# PowerShell script to create .env file
Write-Host "إنشاء ملف .env..." -ForegroundColor Green

$envContent = @"
# Database Configuration
DATABASE_URL=sqlite:./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# ShipsGo API Configuration
# احصل على API key من https://shipsgo.com
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_FALLBACK_TO_MOCK=true

# Rate Limiting
SHIPSGO_RATE_LIMIT=100

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
"@

# Create .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "تم إنشاء ملف .env بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. افتح ملف .env" -ForegroundColor White
Write-Host "2. استبدل 'your-shipsgo-api-key-here' بمفتاح API الحقيقي من ShipsGo" -ForegroundColor White
Write-Host "3. أو اترك SHIPSGO_FALLBACK_TO_MOCK=true للاختبار" -ForegroundColor White
Write-Host "4. أعد تشغيل الخادم" -ForegroundColor White
Write-Host ""
Write-Host "للاختبار السريع: اترك SHIPSGO_FALLBACK_TO_MOCK=true" -ForegroundColor Cyan
Write-Host "للإنتاج: احصل على API key حقيقي من https://shipsgo.com" -ForegroundColor Cyan