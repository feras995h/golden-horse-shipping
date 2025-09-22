# سكريبت PowerShell لإفراغ قاعدة البيانات
Write-Host "🗑️  بدء إفراغ قاعدة البيانات..." -ForegroundColor Yellow

# التحقق من وجود قاعدة البيانات
if (-not (Test-Path "database.sqlite")) {
    Write-Host "❌ قاعدة البيانات غير موجودة!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تم العثور على قاعدة البيانات" -ForegroundColor Green

# تشغيل سكريبت SQL
try {
    Write-Host "🔄 تشغيل سكريبت إفراغ قاعدة البيانات..." -ForegroundColor Cyan
    
    # استخدام sqlite3 command line tool
    $sqlContent = Get-Content "clear-database.sql" -Raw
    $sqlContent | sqlite3 database.sqlite
    
    Write-Host "✅ تم إفراغ قاعدة البيانات بنجاح!" -ForegroundColor Green
    Write-Host "📊 قاعدة البيانات الآن فارغة وجاهزة للاستخدام" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ خطأ في إفراغ قاعدة البيانات: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 تم الانتهاء من إفراغ قاعدة البيانات!" -ForegroundColor Green

