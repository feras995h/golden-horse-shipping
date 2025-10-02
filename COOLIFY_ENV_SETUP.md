# إعداد متغيرات البيئة في Coolify

## المشكلة الحالية
التطبيق يحاول الاتصال بمضيف يسمى "base" بدلاً من عنوان قاعدة البيانات الصحيح.

## الحل: إعداد متغيرات البيئة في Coolify

### الطريقة 1: استخدام DATABASE_URL (موصى بها)
أضف المتغير التالي في Coolify:

```bash
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
```

### الطريقة 2: استخدام المتغيرات الفردية (أكثر موثوقية في بعض الحالات)
أضف المتغيرات التالية في Coolify:

```bash
# نوع قاعدة البيانات
DB_TYPE=postgres

# معلومات الاتصال
DB_HOST=72.60.92.146
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l
DB_NAME=postgres

# إعدادات SSL
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false

# إعدادات قاعدة البيانات
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

### متغيرات إضافية مهمة

```bash
# بيئة التشغيل
NODE_ENV=production
PORT=3000
BACKEND_PORT=3001
FRONTEND_PORT=3000

# JWT للمصادقة
JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This-To-Secure-Random-String
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000

# معلومات التطبيق
APP_NAME=Golden Horse Shipping
APP_VERSION=1.0.0
DEFAULT_LANGUAGE=ar

# مسار رفع الملفات
UPLOAD_PATH=/app/uploads

# ShipsGo API
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=6eada10b-fcd9-4ab8-ba19-3e2cb33fc1fa
SHIPSGO_USE_MOCK=false
```

## خطوات الإعداد في Coolify

1. افتح مشروعك في Coolify
2. اذهب إلى **Environment Variables**
3. أضف جميع المتغيرات المذكورة أعلاه
4. احفظ التغييرات
5. أعد نشر التطبيق

## التحقق من الإعدادات

بعد النشر، تحقق من سجلات الحاوية. يجب أن ترى:

```
🔍 Database Configuration Debug:
  - NODE_ENV: production
  - DATABASE_URL: postgres://postgres:...
  - DB_HOST: 72.60.92.146
  - DB_TYPE: postgres
  - Is PostgreSQL: true
  - Synchronize: true
✅ Using individual database variables
```

أو:

```
✅ Using DATABASE_URL
```

## ملاحظات مهمة

1. **لا تستخدم قيمة "base" أو أي قيمة افتراضية** - تأكد من تعيين جميع المتغيرات بشكل صريح
2. **DB_SYNCHRONIZE=true** في المرة الأولى لإنشاء الجداول، ثم غيّره إلى `false` في الإنتاج
3. **تأكد من أن البورت 5433** مفتوح وقابل للوصول من Coolify
4. إذا كانت قاعدة البيانات تتطلب SSL، استخدم:
   ```bash
   DB_SSL=true
   DB_SSL_REJECT_UNAUTHORIZED=false
   ```

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. تحقق من أن جميع المتغيرات محددة بشكل صحيح في Coolify
2. تأكد من عدم وجود مسافات قبل أو بعد القيم
3. تحقق من أن قاعدة البيانات قابلة للوصول من خادم Coolify
4. راجع سجلات الحاوية للتأكد من أي رسائل خطأ

