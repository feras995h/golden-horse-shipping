@echo off
echo ========================================
echo Golden Horse - Safe VPS Deployment
echo النشر الآمن لتطبيق الحصان الذهبي
echo ========================================
echo.

echo ⚠️  تحذير مهم / IMPORTANT WARNING ⚠️
echo.
echo إذا كان هناك موقع آخر على الخادم، قد يتأثر بالنشر
echo If there's another website on the server, it might be affected
echo.
echo يرجى اتباع الخطوات التالية بعناية
echo Please follow these steps carefully
echo.

echo الخطوة 1: الاتصال بالخادم / Step 1: Connect to Server
echo ---------------------------------------------------
echo ssh root@72.60.92.146
echo.

echo الخطوة 2: فحص الموارد أولاً / Step 2: Check Resources First
echo --------------------------------------------------------
echo بعد الاتصال بالخادم، قم بتشغيل:
echo After connecting to the server, run:
echo.
echo # إنشاء سكريبت فحص الموارد
echo # Create resource check script
echo nano check-server-resources.sh
echo.
echo # انسخ محتوى ملف check-server-resources.sh والصقه
echo # Copy content from check-server-resources.sh and paste it
echo.
echo # احفظ واخرج (Ctrl+X, Y, Enter)
echo # Save and exit (Ctrl+X, Y, Enter)
echo.
echo chmod +x check-server-resources.sh
echo ./check-server-resources.sh
echo.

echo الخطوة 3: مراجعة النتائج / Step 3: Review Results
echo -----------------------------------------------
echo راجع النتائج بعناية وتأكد من:
echo Review results carefully and ensure:
echo.
echo ✅ استخدام الذاكرة أقل من 70%%
echo ✅ Memory usage less than 70%%
echo.
echo ✅ مساحة القرص أقل من 80%%
echo ✅ Disk space less than 80%%
echo.
echo ✅ لا توجد تضاربات في المنافذ
echo ✅ No port conflicts
echo.

echo الخطوة 4: النشر الآمن / Step 4: Safe Deployment
echo ----------------------------------------------
echo إذا كانت النتائج جيدة، قم بالنشر:
echo If results are good, proceed with deployment:
echo.
echo # إنشاء سكريبت النشر المحدث
echo # Create updated deployment script
echo nano deploy-to-vps.sh
echo.
echo # انسخ محتوى ملف deploy-to-vps.sh المحدث والصقه
echo # Copy updated deploy-to-vps.sh content and paste it
echo.
echo chmod +x deploy-to-vps.sh
echo ./deploy-to-vps.sh
echo.

echo خيارات النشر البديلة / Alternative Deployment Options:
echo ===================================================
echo.
echo الخيار أ: منافذ مخصصة / Option A: Custom Ports
echo --------------------------------------------
echo إذا كان المنفذ 80 مستخدماً، استخدم منافذ أخرى:
echo If port 80 is used, use different ports:
echo.
echo - التطبيق الرئيسي: http://72.60.92.146:8080
echo - Main App: http://72.60.92.146:8080
echo.
echo - الواجهة الأمامية: http://72.60.92.146:3002
echo - Frontend: http://72.60.92.146:3002
echo.
echo - الخادم الخلفي: http://72.60.92.146:3003/api
echo - Backend: http://72.60.92.146:3003/api
echo.

echo الخيار ب: نطاق فرعي / Option B: Subdomain
echo ----------------------------------------
echo استخدم نطاق فرعي للتطبيق:
echo Use subdomain for the application:
echo.
echo golden-horse.yourdomain.com
echo.

echo مراقبة النشر / Deployment Monitoring:
echo ===================================
echo.
echo أثناء النشر، راقب:
echo During deployment, monitor:
echo.
echo # استخدام الموارد
echo # Resource usage
echo watch -n 5 'free -h && df -h'
echo.
echo # سجلات التطبيق
echo # Application logs
echo docker-compose -f docker-compose.prod.yml logs -f
echo.
echo # حالة الحاويات
echo # Container status
echo docker-compose -f docker-compose.prod.yml ps
echo.

echo خطة الطوارئ / Emergency Plan:
echo =============================
echo.
echo إذا تعطل موقع آخر، قم فوراً بـ:
echo If another site breaks, immediately:
echo.
echo # إيقاف التطبيق
echo # Stop application
echo docker-compose -f docker-compose.prod.yml down
echo.
echo # إعادة تشغيل الخدمات الأصلية
echo # Restart original services
echo systemctl restart nginx apache2
echo.

echo الروابط المتوقعة / Expected URLs:
echo ===============================
echo.
echo بعد النشر الناجح:
echo After successful deployment:
echo.
echo 🌐 التطبيق الرئيسي / Main App:
echo    http://72.60.92.146
echo.
echo 🔧 واجهة برمجة التطبيقات / API:
echo    http://72.60.92.146:3001/api
echo.
echo 🖥️  الواجهة الأمامية / Frontend:
echo    http://72.60.92.146:3000
echo.
echo ❤️  فحص الصحة / Health Check:
echo    http://72.60.92.146/health
echo.

echo بيانات تسجيل الدخول / Login Credentials:
echo ======================================
echo Username: admin
echo Password: admin123
echo.

echo أوامر استكشاف الأخطاء / Troubleshooting Commands:
echo ===============================================
echo.
echo # عرض السجلات
echo # View logs
echo docker-compose -f docker-compose.prod.yml logs [service_name]
echo.
echo # إعادة تشغيل خدمة
echo # Restart service
echo docker-compose -f docker-compose.prod.yml restart [service_name]
echo.
echo # فحص حالة الخدمات
echo # Check service status
echo docker-compose -f docker-compose.prod.yml ps
echo.
echo # فحص استخدام الموارد
echo # Check resource usage
echo docker stats
echo.

echo ========================================
echo جاهز للنشر الآمن؟
echo Ready for safe deployment?
echo ========================================
echo.
echo تذكر: السلامة أولاً!
echo Remember: Safety first!
echo.
pause