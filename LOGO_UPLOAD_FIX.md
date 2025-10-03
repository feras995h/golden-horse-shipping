# دليل إصلاح مشكلة تحميل الشعار (Logo Upload Fix Guide)

## اللغة العربية (Arabic)

### تحليل المشكلة (Problem Analysis)
- **الخطأ المبلغ عنه**: خطأ 400 (Bad Request) عند محاولة جلب الصورة من `/uploads/` عبر مُحسِّن الصور في Next.js.
- **السبب الرئيسي**: مجلد `/uploads/` يتم تقديمه من الخادم الخلفي (Nest.js) على منفذ مختلف، لكن Next.js لا يعيد توجيه الطلبات إلى هناك، مما يؤدي إلى فشل جلب الصورة داخليًا.

### الحل المطبق (Applied Solution)
- **إضافة إعادة توجيه في Next.js**: تم تعديل `next.config.js` لإعادة توجيه `/uploads/*` إلى الخادم الخلفي.
- **تحديث نطاقات الصور**: تم إضافة النطاق الإنتاجي `goldenhorse-ly.com` إلى `images.domains` لتجنب مشاكل في الإنتاج.

### خطوات إعادة النشر (Redeployment Steps)
1. أعد بناء التطبيق وأعد نشره باستخدام السكريبتات السابقة مثل `quick-healthcheck-final-fix.sh` أو `.bat`.
2. تأكد من أن الملف المرفوع موجود في مجلد `backend/uploads/`.

### التحقق (Verification)
- قم بتحميل شعار جديد من لوحة التحكم.
- تحقق من عرض الشعار بشكل صحيح دون أخطاء في وحدة التحكم.

### نصائح لاستكشاف الأخطاء (Troubleshooting Tips)
- تحقق من وجود الملف في `uploads/`.
- أعد تشغيل الخادم إذا استمرت المشكلة.

## English

### Problem Analysis
- **Reported Error**: 400 (Bad Request) when fetching image from `/uploads/` via Next.js image optimizer.
- **Root Cause**: `/uploads/` is served by the backend (Nest.js) on a different port, but Next.js does not proxy requests to it, causing internal fetch failure.

### Applied Solution
- **Added Rewrite in Next.js**: Modified `next.config.js` to rewrite `/uploads/*` to the backend.
- **Updated Image Domains**: Added production domain `goldenhorse-ly.com` to `images.domains` to avoid production issues.

### Redeployment Steps
1. Rebuild and redeploy the application using previous scripts like `quick-healthcheck-final-fix.sh` or `.bat`.
2. Ensure the uploaded file exists in `backend/uploads/`.

### Verification
- Upload a new logo from the admin panel.
- Check if the logo displays correctly without console errors.

### Troubleshooting Tips
- Verify the file exists in `uploads/`.
- Restart the server if the issue persists.