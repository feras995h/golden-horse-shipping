# حل مشكلة 503 Service Unavailable

**الموقع:** goldenhorse-ly.com  
**الخطأ:** 503 Service Unavailable  
**التاريخ:** 2025-10-02

---

## 🔍 تحليل المشكلة

### خطأ 503 يعني:
- ❌ الخادم لا يستطيع معالجة الطلبات حالياً
- ❌ التطبيق غير متاح أو متوقف
- ❌ مشكلة في الـ healthcheck
- ❌ Container فشل في البدء

---

## 🚨 الأسباب المحتملة

### 1. **Healthcheck فشل** (الأكثر احتمالاً)
```
السبب: wget لم يجد Backend على المنفذ 3001
الحل: تم إصلاحه في آخر commit
```

### 2. **Container لم يبدأ**
```
السبب: خطأ في البناء أو البدء
الحل: فحص الـ logs
```

### 3. **Database Connection فشل**
```
السبب: لا يمكن الاتصال بقاعدة البيانات
الحل: التحقق من DATABASE_URL
```

### 4. **Port Conflict**
```
السبب: المنفذ مستخدم من تطبيق آخر
الحل: تغيير المنفذ
```

---

## ✅ الحلول السريعة

### الحل 1: إعادة النشر مع آخر التحديثات

في Coolify Dashboard:

```
1. اذهب إلى التطبيق
2. اضغط "Redeploy"
3. انتظر 5-7 دقائق
4. راقب الـ logs
```

**السبب:** آخر commit أصلح مشكلة الـ healthcheck

---

### الحل 2: فحص الـ Logs

في Coolify Dashboard:

```
1. اذهب إلى Application -> Logs
2. ابحث عن:
   - "Error"
   - "Failed"
   - "Connection refused"
   - "ECONNREFUSED"
```

**الأخطاء الشائعة:**

#### أ. Database Connection Error:
```
Error: connect ECONNREFUSED
Error: Connection to database failed
```

**الحل:**
```
1. تحقق من DATABASE_URL في Environment Variables
2. تأكد من أن قاعدة البيانات تعمل
3. تحقق من firewall settings
```

#### ب. Port Already in Use:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**الحل:**
```
1. أوقف التطبيق القديم
2. أعد النشر
```

#### ج. Build Error:
```
Error: Cannot find module
Error: Module not found
```

**الحل:**
```
1. تحقق من package.json
2. تأكد من npm install نجح
```

---

### الحل 3: تحديث Environment Variables

في Coolify Dashboard -> Environment Variables:

```env
# تأكد من وجود هذه المتغيرات:

NODE_ENV=production
PORT=3000
FRONTEND_PORT=3000
BACKEND_PORT=3001

# Database (مهم جداً!)
DATABASE_URL=postgresql://postgres:Feras123@ep-weathered-darkness-a5ixqhzr.us-east-2.aws.neon.tech:5433/neondb?sslmode=require

# JWT
JWT_SECRET=cc551c5e5110b8aee35898a7fa3ec0269d38e01849d711a9798ec61b154009a7dddcc71709725ee258c43f2e1678c3638534137a96211900425348409bfb1789
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://goldenhorse-ly.com
```

**بعد التحديث:**
```
1. احفظ التغييرات
2. اضغط "Redeploy"
```

---

### الحل 4: تعطيل Healthcheck مؤقتاً

في Coolify Dashboard -> Settings:

```
1. اذهب إلى Healthcheck Settings
2. عطّل الـ Healthcheck مؤقتاً
3. أعد النشر
4. تحقق من أن التطبيق يعمل
5. فعّل الـ Healthcheck مرة أخرى
```

**ملاحظة:** هذا حل مؤقت للتشخيص فقط!

---

### الحل 5: فحص قاعدة البيانات

اختبر الاتصال بقاعدة البيانات:

```bash
# محلياً
node check-database.js
```

**إذا فشل:**
```
1. تحقق من DATABASE_URL
2. تحقق من firewall في Neon
3. تحقق من IP whitelist
```

---

## 🔧 خطوات التشخيص المتقدم

### 1. فحص Container Status

في Coolify Dashboard:

```
Application -> Details
```

ابحث عن:
- **Status:** Running / Stopped / Unhealthy
- **Restart Count:** عدد مرات إعادة التشغيل
- **Last Exit Code:** آخر كود خروج

---

### 2. فحص Healthcheck Logs

```
Application -> Logs -> Healthcheck Logs
```

ابحث عن:
```
✅ Healthcheck: healthy
❌ Healthcheck: unhealthy
❌ Connection refused
❌ Timeout
```

---

### 3. فحص Build Logs

```
Application -> Logs -> Build Logs
```

تأكد من:
```
✅ npm install: success
✅ npm run build: success
✅ Docker build: success
```

---

### 4. فحص Runtime Logs

```
Application -> Logs -> Container Logs
```

ابحث عن:
```
✅ Backend startup completed successfully!
✅ Frontend: http://localhost:3000
✅ Health Check: http://localhost:3001/api/health
```

---

## 🎯 الحل الموصى به (خطوة بخطوة)

### الخطوة 1: تحديث من GitHub

```bash
# في Coolify Dashboard
1. اذهب إلى Application
2. اضغط "Redeploy"
3. سيقوم بـ Pull آخر التحديثات
```

**السبب:** آخر commit (545c4fe) أصلح:
- ✅ إضافة wget للـ healthcheck
- ✅ تحسين start-period
- ✅ إصلاح جميع المشاكل

---

### الخطوة 2: تحديث Healthcheck Settings

```
في Coolify Dashboard -> Settings -> Healthcheck:

✅ Enable Healthcheck: ON
✅ Healthcheck Path: /api/health
✅ Healthcheck Interval: 45
✅ Healthcheck Timeout: 20
✅ Healthcheck Retries: 6
✅ Start Period: 120  ← مهم جداً!
```

---

### الخطوة 3: التحقق من Environment Variables

```env
# تأكد من وجود جميع المتغيرات المطلوبة
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=https://goldenhorse-ly.com
```

---

### الخطوة 4: إعادة النشر

```
1. احفظ جميع التغييرات
2. اضغط "Redeploy"
3. انتظر 5-7 دقائق
4. راقب الـ logs
```

---

### الخطوة 5: التحقق من النجاح

```bash
# 1. فحص الـ health endpoint
curl https://goldenhorse-ly.com/api/health

# 2. فحص الصفحة الرئيسية
curl https://goldenhorse-ly.com

# 3. فحص في المتصفح
https://goldenhorse-ly.com
```

---

## 📊 الأخطاء الشائعة وحلولها

### خطأ 1: "Connection refused"
```
السبب: Backend لم يبدأ بعد
الحل: زيادة start-period إلى 120 ثانية
```

### خطأ 2: "Database connection failed"
```
السبب: DATABASE_URL خاطئ أو قاعدة البيانات متوقفة
الحل: تحقق من DATABASE_URL وحالة Neon
```

### خطأ 3: "Port already in use"
```
السبب: Container قديم لا يزال يعمل
الحل: أوقف جميع Containers القديمة
```

### خطأ 4: "Module not found"
```
السبب: npm install فشل
الحل: تحقق من package.json وأعد البناء
```

### خطأ 5: "Healthcheck timeout"
```
السبب: التطبيق بطيء في البدء
الحل: زيادة timeout و start-period
```

---

## 🚀 إذا استمرت المشكلة

### خيار 1: النشر على VPS مباشرة

```bash
# استخدم docker-compose
docker-compose --profile production up -d
```

### خيار 2: النشر على Railway

```bash
# Railway يدعم Dockerfile تلقائياً
railway up
```

### خيار 3: النشر على Render

```bash
# Render يدعم Docker
# استخدم الـ Dockerfile الرئيسي
```

---

## 📞 الدعم الفوري

### تحقق من هذه الملفات:

1. **COOLIFY_HEALTHCHECK_FIX.md** - حل مشكلة healthcheck
2. **DEPLOYMENT_FIXES_APPLIED.md** - جميع الإصلاحات
3. **FINAL_DEPLOYMENT_READY.md** - دليل النشر الكامل

### أوامر التشخيص:

```bash
# فحص قاعدة البيانات
node check-database.js

# فحص الـ build محلياً
npm run build

# اختبار Docker محلياً
docker build -t test .
docker run -p 3000:3000 test
```

---

## ✅ قائمة التحقق السريعة

قبل إعادة النشر، تأكد من:

- [ ] آخر commit تم Pull من GitHub
- [ ] Environment Variables كاملة
- [ ] DATABASE_URL صحيح
- [ ] Healthcheck Settings محدّثة
- [ ] Start Period = 120 ثانية
- [ ] CORS_ORIGIN = https://goldenhorse-ly.com

---

## 🎯 الخلاصة

**المشكلة:** 503 Service Unavailable

**السبب الأرجح:** Healthcheck فشل (تم إصلاحه في آخر commit)

**الحل:**
```
1. Redeploy من Coolify Dashboard
2. انتظر 5-7 دقائق
3. تحقق من https://goldenhorse-ly.com
```

**إذا استمرت المشكلة:**
```
1. فحص الـ logs في Coolify
2. تحقق من Environment Variables
3. اختبر قاعدة البيانات
4. تواصل للدعم الفني
```

---

**النظام جاهز! فقط أعد النشر من Coolify Dashboard 🚀**
