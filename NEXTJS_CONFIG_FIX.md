# إصلاح تحذير Next.js Configuration

## المشكلة
ظهر تحذير في Next.js بسبب خيارات غير مدعومة في `next.config.js`:
```
⚠ Invalid next.config.js options detected:  
⚠     Unrecognized key(s) in object: 'legacyBrowsers', 'browsersListForSwc' at "experimental" 
```

## الحل المطبق
تم إزالة الخيارات غير المدعومة من ملف `frontend/next.config.js`:
- `legacyBrowsers: false`
- `browsersListForSwc: true`

## التغييرات المطبقة
```javascript
// قبل الإصلاح
experimental: {
  optimizeCss: true,
  scrollRestoration: true,
  legacyBrowsers: false,        // ← تم إزالتها
  browsersListForSwc: true,     // ← تم إزالتها
  cpus: Math.max(1, (require('os').cpus() || { length: 1 }).length - 1),
},

// بعد الإصلاح
experimental: {
  optimizeCss: true,
  scrollRestoration: true,
  cpus: Math.max(1, (require('os').cpus() || { length: 1 }).length - 1),
},
```

## خطوات التطبيق على VPS
1. رفع التغييرات إلى GitHub
2. سحب التحديثات على VPS:
   ```bash
   git pull origin main
   ```
3. إعادة بناء وتشغيل الحاويات:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## النتيجة المتوقعة
- اختفاء تحذير Next.js
- تشغيل الواجهة الأمامية بدون مشاكل
- الحفاظ على جميع الوظائف الحالية

## ملاحظات
- هذه الخيارات كانت مخصصة لإصدارات أقدم من Next.js
- Next.js 14 لا يدعم هذه الخيارات في قسم `experimental`
- التطبيق سيعمل بنفس الكفاءة بدون هذه الخيارات