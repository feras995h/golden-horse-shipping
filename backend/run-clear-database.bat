@echo off
echo 🗑️  بدء إفراغ قاعدة البيانات...

REM التحقق من وجود قاعدة البيانات
if not exist "database.sqlite" (
    echo ❌ قاعدة البيانات غير موجودة!
    pause
    exit /b 1
)

echo ✅ تم العثور على قاعدة البيانات

REM تشغيل سكريبت SQL
echo 🔄 تشغيل سكريبت إفراغ قاعدة البيانات...

REM استخدام sqlite3 command line tool
sqlite3 database.sqlite < clear-database.sql

if %errorlevel% equ 0 (
    echo ✅ تم إفراغ قاعدة البيانات بنجاح!
    echo 📊 قاعدة البيانات الآن فارغة وجاهزة للاستخدام
) else (
    echo ❌ خطأ في إفراغ قاعدة البيانات
    pause
    exit /b 1
)

echo 🎉 تم الانتهاء من إفراغ قاعدة البيانات!
pause

