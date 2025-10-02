# 🔧 استكشاف مشكلة "No Available Server" - حلول متقدمة

## 🎯 إذا لم تحل المشكلة بعد إضافة المتغيرات

---

## 🔍 التشخيص المتقدم

### 1. تحقق من سجلات Coolify

في Coolify → Logs، ابحث عن:

**✅ Backend يعمل:**
```
[Nest] LOG [NestFactory] Starting Nest application...
Application is running on: http://localhost:3001
```

**✅ Frontend يعمل:**
```
✓ Ready in XXXms
- Local: http://localhost:3000
```

**❌ إذا لم ترَ هذه الرسائل:**
- Backend أو Frontend لم يبدأ بشكل صحيح

### 2. اختبر API مباشرة

افتح في المتصفح:
```
https://your-app-url.com/api/health
```

**النتائج المتوقعة:**

**✅ إذا عمل:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```
→ Backend يعمل، المشكلة في Frontend

**❌ إذا لم يعمل:**
```
404 Not Found
500 Internal Server Error
```
→ Backend لا يعمل

---

## 🛠️ الحلول البديلة

### الحل 1: استخدام URL كامل للـ Backend

بدلاً من `NEXT_PUBLIC_API_URL=/api`، جرب:

```bash
NEXT_PUBLIC_API_URL=https://your-app-domain.com/api
```

أو إذا كنت تستخدم IP:

```bash
NEXT_PUBLIC_API_URL=http://YOUR_IP:3001/api
```

### الحل 2: إصلاح مشكلة البورت

أضف هذا المتغير:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### الحل 3: تحديث CORS

غيّر CORS ليشمل النطاق الفعلي:

```bash
CORS_ORIGIN=https://your-app-domain.com,http://localhost:3000,*
```

### الحل 4: فرض استخدام DATABASE_URL

احذف جميع متغيرات DB الفردية واتركْ فقط:

```bash
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

---

## 🔧 حلول الطوارئ

### إذا استمرت المشكلة، جرب هذه المتغيرات:

```bash
# الأساسيات
NODE_ENV=production
PORT=3000

# API URLs - جرب كل واحد على حدة
NEXT_PUBLIC_API_URL=/api
# أو
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# أو
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Backend
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Database - استخدم هذا فقط
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=cc551c5e5110b8aee35898a7fa3ec0269d38e01849d711a9798ec61b154009a7dddcc71709725ee258c43f2e1678c3638534137a96211900425348409bfb1789
JWT_EXPIRES_IN=7d

# CORS - مفتوح لكل شيء
CORS_ORIGIN=*

# التطبيق
APP_NAME=Golden Horse Shipping
APP_VERSION=1.0.0
DEFAULT_LANGUAGE=ar
UPLOAD_PATH=/app/uploads

# ShipsGo
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=6eada10b-fcd9-4ab8-ba19-3e2cb33fc1fa
SHIPSGO_USE_MOCK=false

# Next.js
NEXT_TELEMETRY_DISABLED=1
```

---

## 🚨 تشخيص المشاكل الشائعة

### المشكلة 1: Backend لا يبدأ

**الأعراض:**
- لا توجد رسائل Backend في السجلات
- `/api/health` لا يعمل

**الحل:**
```bash
DB_LOGGING=true  # لرؤية أخطاء قاعدة البيانات
```

**تحقق من:**
- DATABASE_URL صحيح
- قاعدة البيانات متاحة على البورت 5433

### المشكلة 2: Frontend لا يجد Backend

**الأعراض:**
- Frontend يعمل لكن "No Available Server"
- أخطاء CORS في Console

**الحل:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
CORS_ORIGIN=*
```

### المشكلة 3: مشكلة في Docker Networking

**الأعراض:**
- Backend يعمل لكن Frontend لا يصل إليه

**الحل:**
```bash
NEXT_PUBLIC_API_URL=/api
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

---

## 🧪 اختبار تدريجي

### الخطوة 1: اختبر Backend فقط

```bash
# أضف هذه المتغيرات فقط
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
NODE_ENV=production
BACKEND_PORT=3001
JWT_SECRET=cc551c5e5110b8aee35898a7fa3ec0269d38e01849d711a9798ec61b154009a7dddcc71709725ee258c43f2e1678c3638534137a96211900425348409bfb1789
DB_SYNCHRONIZE=true
```

**اختبر:** `https://your-app.com/api/health`

### الخطوة 2: أضف Frontend

```bash
# أضف هذه للمتغيرات السابقة
FRONTEND_PORT=3000
PORT=3000
NEXT_PUBLIC_API_URL=/api
NEXT_TELEMETRY_DISABLED=1
```

### الخطوة 3: أضف باقي المتغيرات

---

## 📋 قائمة التحقق السريع

- [ ] DATABASE_URL محدد ✅
- [ ] NEXT_PUBLIC_API_URL محدد ✅  
- [ ] Backend يظهر في السجلات ✅
- [ ] Frontend يظهر في السجلات ✅
- [ ] `/api/health` يعمل ✅
- [ ] لا توجد أخطاء CORS ✅

---

## 🆘 إذا لم يعمل أي شيء

### جرب هذا الحل الأخير:

```bash
# احذف كل المتغيرات وأضف هذه فقط
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
JWT_SECRET=cc551c5e5110b8aee35898a7fa3ec0269d38e01849d711a9798ec61b154009a7dddcc71709725ee258c43f2e1678c3638534137a96211900425348409bfb1789
NEXT_PUBLIC_API_URL=http://localhost:3001/api
CORS_ORIGIN=*
DB_SYNCHRONIZE=true
```

---

## 📞 معلومات التشخيص

أرسل هذه المعلومات إذا استمرت المشكلة:

1. **رابط التطبيق:** `https://your-app.com`
2. **نتيجة:** `https://your-app.com/api/health`
3. **أخطاء Console:** (F12 → Console)
4. **سجلات Coolify:** آخر 50 سطر

---

**آخر تحديث:** 2 أكتوبر 2025  
**الحالة:** 🔧 استكشاف أخطاء متقدم

