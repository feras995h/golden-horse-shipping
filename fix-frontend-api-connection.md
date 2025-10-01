# حل مشكلة اتصال الواجهة الأمامية بـ API في الإنتاج

## المشكلة
الواجهة الأمامية تحاول الاتصال بـ `http://localhost:3001/api/auth/login` بدلاً من استخدام عنوان الخادم الصحيح في الإنتاج.

## السبب
عدم وجود ملف متغيرات البيئة للإنتاج في الواجهة الأمامية، مما يجعلها تستخدم القيم الافتراضية (localhost).

## الحلول المطبقة

### 1. إنشاء ملف `.env.production` للواجهة الأمامية
```env
# Frontend Production Environment
NODE_ENV=production

# Backend API URL in production - Use relative path for Nginx proxy
NEXT_PUBLIC_API_URL=/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=Golden Horse Shipping
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LANGUAGE=ar

# VPS Configuration
NEXT_PUBLIC_VPS_URL=http://72.60.92.146

# Build Configuration
NEXT_TELEMETRY_DISABLED=1
```

### 2. تحديث `frontend/Dockerfile`
- إضافة نسخ ملف `.env.production` أثناء البناء
- إصلاح فحص الصحة ليستخدم المنفذ الصحيح (3000)

### 3. التحقق من إعدادات Docker Compose
ملف `docker-compose.prod.yml` يحتوي بالفعل على المتغيرات الصحيحة:
```yaml
frontend:
  environment:
    NODE_ENV: production
    NEXT_PUBLIC_API_URL: /api
    NEXT_PUBLIC_APP_NAME: Golden Horse Shipping
    NEXT_PUBLIC_APP_VERSION: 1.0.0
    NEXT_PUBLIC_DEFAULT_LANGUAGE: ar
    NEXT_PUBLIC_VPS_URL: http://72.60.92.146
    NEXT_TELEMETRY_DISABLED: 1
```

## خطوات التطبيق على الخادم

### 1. إيقاف الخدمات الحالية
```bash
docker-compose -f docker-compose.prod.yml down
```

### 2. إعادة البناء مع عدم استخدام الذاكرة المؤقتة
```bash
docker-compose -f docker-compose.prod.yml build --no-cache frontend
```

### 3. تشغيل الخدمات
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. التحقق من الحالة
```bash
# فحص حالة الحاويات
docker-compose -f docker-compose.prod.yml ps

# فحص سجلات الواجهة الأمامية
docker-compose -f docker-compose.prod.yml logs frontend

# فحص سجلات الخادم الخلفي
docker-compose -f docker-compose.prod.yml logs backend
```

## التحقق من الإصلاح

### 1. فحص متغيرات البيئة داخل الحاوية
```bash
docker exec -it golden-horse-frontend env | grep NEXT_PUBLIC
```

### 2. اختبار API من المتصفح
افتح أدوات المطور في المتصفح وتحقق من:
- شبكة الطلبات (Network tab)
- يجب أن تظهر الطلبات إلى `/api/auth/login` بدلاً من `localhost:3001`

### 3. اختبار تسجيل الدخول
- اذهب إلى صفحة تسجيل الدخول
- أدخل بيانات صحيحة
- يجب أن يتم تسجيل الدخول بنجاح دون أخطاء في وحدة التحكم

## النتيجة المتوقعة

بعد تطبيق هذه الحلول:
- ✅ الواجهة الأمامية ستستخدم `/api` بدلاً من `localhost:3001`
- ✅ Nginx سيوجه طلبات `/api` إلى الخادم الخلفي
- ✅ تسجيل الدخول سيعمل بشكل طبيعي
- ✅ جميع وظائف API ستعمل بشكل صحيح

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من بناء الواجهة الأمامية:**
```bash
docker-compose -f docker-compose.prod.yml logs frontend | grep -i error
```

2. **تحقق من إعدادات Nginx:**
```bash
docker-compose -f docker-compose.prod.yml logs nginx
```

3. **تحقق من اتصال الشبكة:**
```bash
docker network ls
docker network inspect golden-horse-network
```

4. **اختبار API مباشرة:**
```bash
curl -X POST http://72.60.92.146/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```