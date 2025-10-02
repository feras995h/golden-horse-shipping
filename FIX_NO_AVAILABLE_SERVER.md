# 🔧 حل مشكلة "No Available Server"

## 🎯 المشكلة
بعد النشر الناجح على Coolify، الواجهة تظهر لكن تظهر رسالة:
```
No Available Server
```

## 🔍 السبب
الـ Frontend يحاول الاتصال بـ Backend على `http://localhost:3001/api`، لكن في Docker/Coolify:
- Frontend يعمل على البورت 3000
- Backend يعمل على البورت 3001
- لكن الـ Frontend لا يعرف كيف يصل للـ Backend

## ✅ الحل

### الطريقة 1: استخدام Rewrites الداخلية (الأسهل)

أضف هذا المتغير في Coolify:

```bash
NEXT_PUBLIC_API_URL=/api
```

هذا يجعل الـ Frontend يستخدم `/api` بدلاً من `http://localhost:3001/api`، والـ Next.js rewrites سيوجه الطلبات للـ Backend داخلياً.

### الطريقة 2: استخدام URL الكامل للـ Backend

إذا كان لديك نطاق خاص، استخدم:

```bash
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

أو إذا كنت تستخدم Coolify بدون نطاق:

```bash
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001/api
```

---

## 📋 المتغيرات المحدثة الكاملة

أضف هذه المتغيرات في Coolify (محدّثة):

```bash
# ===================================
# Server Configuration
# ===================================
NODE_ENV=production
PORT=3000
BACKEND_PORT=3001
FRONTEND_PORT=3000

# ===================================
# API Configuration (مهم جداً!)
# ===================================
NEXT_PUBLIC_API_URL=/api
FRONTEND_URL=http://localhost:3000

# ===================================
# Database Configuration
# ===================================
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
DB_SYNCHRONIZE=true
DB_LOGGING=false

# ===================================
# JWT Authentication
# ===================================
JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This
JWT_EXPIRES_IN=7d

# ===================================
# CORS Configuration
# ===================================
CORS_ORIGIN=*

# ===================================
# Application Info
# ===================================
APP_NAME=Golden Horse Shipping
APP_VERSION=1.0.0
DEFAULT_LANGUAGE=ar
UPLOAD_PATH=/app/uploads

# ===================================
# ShipsGo API
# ===================================
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=6eada10b-fcd9-4ab8-ba19-3e2cb33fc1fa
SHIPSGO_USE_MOCK=false

# ===================================
# Next.js
# ===================================
NEXT_TELEMETRY_DISABLED=1
```

---

## 🔧 التعديلات المطلوبة

### 1. تحديث متغيرات البيئة

في Coolify → Environment Variables:

1. **أضف أو عدّل:**
   ```bash
   NEXT_PUBLIC_API_URL=/api
   ```

2. **احفظ التغييرات**

3. **أعد النشر** (Redeploy)

### 2. تحقق من الـ Rewrites

الـ `next.config.js` يحتوي على rewrites تلقائياً. عند استخدام `NEXT_PUBLIC_API_URL=/api`، الطلبات ستُوجّه لـ `http://localhost:3001/api` داخلياً.

---

## 🎯 كيف يعمل؟

### في البيئة المحلية:
```
Frontend (3000) → API (http://localhost:3001/api) ✅
```

### في Coolify (بدون NEXT_PUBLIC_API_URL=/api):
```
Frontend (3000) → API (http://localhost:3001/api) ❌
                    (localhost داخل المتصفح ≠ localhost داخل Docker)
```

### في Coolify (مع NEXT_PUBLIC_API_URL=/api):
```
Frontend (3000) → /api → Next.js Rewrites → Backend (3001) ✅
                        (داخل نفس الحاوية)
```

---

## ✅ خطوات التحقق

### 1. بعد إعادة النشر، افتح Developer Tools في المتصفح:

```
F12 → Console
```

### 2. ابحث عن أخطاء الشبكة:

**قبل الإصلاح:**
```
❌ Failed to load resource: net::ERR_CONNECTION_REFUSED
❌ http://localhost:3001/api/...
```

**بعد الإصلاح:**
```
✅ 200 OK
✅ /api/...
```

### 3. تحقق من اتصال API:

افتح:
```
https://your-app-url.com/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: لا تزال رسالة "No Available Server"

**الحل 1: تحقق من المتغيرات**
```bash
# في Coolify، تأكد من وجود:
NEXT_PUBLIC_API_URL=/api
```

**الحل 2: تحقق من سجلات Backend**
```bash
# في سجلات Coolify، ابحث عن:
✅ [Nest] LOG [NestFactory] Starting Nest application...
✅ Application is running on: http://localhost:3001
```

إذا لم ترَ هذه الرسائل، Backend لم يبدأ بشكل صحيح.

**الحل 3: تحقق من Health Check**
```bash
# في سجلات Coolify:
✅ Backend startup complete
✅ Both services started successfully!
```

### المشكلة: Backend لا يعمل

**الأسباب المحتملة:**
1. قاعدة البيانات غير متصلة → راجع `DATABASE_CONNECTION_TEST_RESULTS.md`
2. Backend استغرق وقتاً طويلاً للبدء → زد `start-period` في Healthcheck
3. خطأ في الكود → راجع السجلات

---

## 📊 هيكل الـ Docker في Coolify

```
┌─────────────────────────────────────────┐
│           Docker Container              │
│                                         │
│  ┌─────────────┐    ┌──────────────┐  │
│  │  Frontend   │    │   Backend    │  │
│  │  (Port 3000)│◄───┤  (Port 3001) │  │
│  └─────────────┘    └──────────────┘  │
│         │                    │         │
│         │                    │         │
│         └────────┬───────────┘         │
│                  │                     │
└──────────────────┼─────────────────────┘
                   │
                   ▼
          Coolify Proxy (Port 80/443)
                   │
                   ▼
              الإنترنت 🌐
```

**مع `NEXT_PUBLIC_API_URL=/api`:**
- المتصفح يطلب: `https://your-app.com/api/...`
- Coolify يوجه للـ Frontend (3000)
- Next.js rewrites يوجه للـ Backend (3001) داخلياً
- Backend يرد بالبيانات ✅

---

## 🎉 الخلاصة

**المشكلة:** Frontend لا يستطيع الوصول للـ Backend  
**السبب:** `NEXT_PUBLIC_API_URL` غير محدد  
**الحل:** أضف `NEXT_PUBLIC_API_URL=/api` في Coolify  
**الوقت:** دقيقة واحدة للإصلاح  

---

## 📝 ملاحظات إضافية

### للنطاقات المخصصة:

إذا كان لديك نطاق مثل `goldenhorse.com`:

```bash
NEXT_PUBLIC_API_URL=https://goldenhorse.com/api
FRONTEND_URL=https://goldenhorse.com
CORS_ORIGIN=https://goldenhorse.com
```

### للـ IP مباشرة:

إذا كنت تستخدم عنوان IP مثل `72.60.92.146`:

```bash
NEXT_PUBLIC_API_URL=http://72.60.92.146:3001/api
FRONTEND_URL=http://72.60.92.146:3000
CORS_ORIGIN=http://72.60.92.146:3000,http://72.60.92.146
```

---

**آخر تحديث:** 2 أكتوبر 2025  
**الحالة:** ✅ تم التوثيق والاختبار


