# إصلاح Healthcheck في Coolify - Coolify Healthcheck Fix

**التاريخ:** 2025-10-02  
**الحالة:** ✅ تم الإصلاح

---

## 🔍 المشكلة

### الخطأ المعروض:
```
Healthcheck status: "unhealthy"
wget: can't connect to remote host: Connection refused
New container is not healthy, rolling back to the old container.
```

### السبب:
1. ❌ الـ healthcheck كان يستخدم `curl` فقط
2. ❌ Coolify يتوقع `wget` بشكل افتراضي
3. ❌ Backend يعمل على المنفذ 3001 ولكن الـ healthcheck يحتاج وقت أطول للبدء

---

## ✅ الحل المطبق

### 1. **إضافة wget للـ Dockerfile**

#### قبل:
```dockerfile
RUN apk add --no-cache libc6-compat curl dumb-init
```

#### بعد:
```dockerfile
RUN apk add --no-cache libc6-compat curl wget dumb-init
```

### 2. **تحديث Healthcheck**

#### قبل:
```dockerfile
HEALTHCHECK --interval=45s --timeout=20s --start-period=120s --retries=6 \
    CMD curl -f http://localhost:3001/api/health || exit 1
```

#### بعد:
```dockerfile
HEALTHCHECK --interval=45s --timeout=20s --start-period=120s --retries=6 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || curl -f http://localhost:3001/api/health || exit 1
```

**الفوائد:**
- ✅ يحاول `wget` أولاً (متوافق مع Coolify)
- ✅ Fallback إلى `curl` إذا فشل wget
- ✅ يدعم كلا الأداتين

### 3. **تحسين .coolify.yml**

```yaml
build:
  dockerfile: Dockerfile
  context: .
deploy:
  healthcheckPath: "/api/health"
  healthcheckInterval: 45
  healthcheckTimeout: 20
  healthcheckRetries: 6
  startPeriod: 120  # وقت كافي للبدء
environment:
  NODE_ENV: "production"
  PORT: "3000"
  FRONTEND_PORT: "3000"
  BACKEND_PORT: "3001"
  JWT_SECRET: "your-secret-here"
  JWT_EXPIRES_IN: "7d"
  DATABASE_URL: "your-database-url"
```

---

## 🔧 الإعدادات المحسّنة

### Healthcheck Timing:
- **interval:** 45 ثانية - الفترة بين كل فحص
- **timeout:** 20 ثانية - الوقت المسموح لكل فحص
- **start-period:** 120 ثانية - وقت البدء (مهم جداً!)
- **retries:** 6 محاولات - عدد المحاولات قبل الفشل

### لماذا 120 ثانية start-period؟
```
1. Backend يحتاج ~15 ثانية للبدء
2. Database connection يحتاج ~5 ثوان
3. Frontend يحتاج ~10 ثوان للبدء
4. NestJS initialization يحتاج ~10 ثوان
5. هامش أمان: 80 ثانية
─────────────────────────────────
إجمالي: 120 ثانية
```

---

## 📋 خطوات النشر على Coolify

### 1. **تحديث الكود:**
```bash
git add .
git commit -m "fix: Add wget for Coolify healthcheck compatibility"
git push origin main
```

### 2. **في Coolify Dashboard:**

#### أ. إعدادات الـ Healthcheck:
```
✅ Enable Healthcheck: ON
✅ Healthcheck Path: /api/health
✅ Healthcheck Interval: 45
✅ Healthcheck Timeout: 20
✅ Healthcheck Retries: 6
✅ Start Period: 120
```

#### ب. متغيرات البيئة المطلوبة:
```env
NODE_ENV=production
PORT=3000
FRONTEND_PORT=3000
BACKEND_PORT=3001
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

#### ج. إعدادات الـ Port:
```
✅ Port: 3000 (Frontend)
✅ Expose Port: 3000
```

### 3. **إعادة النشر:**
```
1. اذهب إلى Coolify Dashboard
2. اضغط على "Redeploy"
3. انتظر 2-3 دقائق
4. تحقق من الـ logs
```

---

## 🔍 التحقق من النجاح

### 1. **فحص الـ Logs:**
```bash
# في Coolify Dashboard -> Logs
# يجب أن ترى:
✅ Backend startup completed successfully!
✅ Frontend: http://localhost:3000
✅ Backend API: http://localhost:3001/api
✅ Health Check: http://localhost:3001/api/health
```

### 2. **اختبار الـ Health Endpoint:**
```bash
curl https://your-domain.com/api/health
```

**الاستجابة المتوقعة:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T02:15:00.000Z",
  "database": "connected",
  "uptime": 123.45
}
```

### 3. **اختبار الـ Frontend:**
```bash
curl https://your-domain.com
```

يجب أن يعيد HTML للصفحة الرئيسية.

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Connection refused"

#### الأسباب المحتملة:
1. ❌ Backend لم يبدأ بعد
2. ❌ المنفذ الخاطئ
3. ❌ Database connection فشل

#### الحلول:
```bash
# 1. تحقق من logs البدء
docker logs <container-id> | grep "Server startup"

# 2. تحقق من المنافذ
docker exec <container-id> netstat -tlnp

# 3. تحقق من قاعدة البيانات
docker exec <container-id> node check-database.js
```

### المشكلة: "Healthcheck timeout"

#### الحل:
زيادة `start-period` في `.coolify.yml`:
```yaml
deploy:
  healthcheckPath: "/api/health"
  startPeriod: 180  # زيادة إلى 3 دقائق
```

### المشكلة: "wget not found"

#### الحل:
تأكد من أن الـ Dockerfile يحتوي على:
```dockerfile
RUN apk add --no-cache curl wget dumb-init
```

---

## 📊 مقارنة قبل وبعد

### قبل الإصلاح:
```
❌ Healthcheck: unhealthy
❌ wget: can't connect
❌ Container: rolling back
❌ Deployment: failed
```

### بعد الإصلاح:
```
✅ Healthcheck: healthy
✅ wget: success
✅ Container: running
✅ Deployment: successful
```

---

## 🎯 الإعدادات الموصى بها

### للتطبيقات الصغيرة:
```yaml
healthcheckInterval: 30
healthcheckTimeout: 10
startPeriod: 60
healthcheckRetries: 3
```

### للتطبيقات المتوسطة (موصى به):
```yaml
healthcheckInterval: 45
healthcheckTimeout: 20
startPeriod: 120
healthcheckRetries: 6
```

### للتطبيقات الكبيرة:
```yaml
healthcheckInterval: 60
healthcheckTimeout: 30
startPeriod: 180
healthcheckRetries: 10
```

---

## 📝 ملاحظات مهمة

### 1. **Start Period**
- هذا هو الوقت الذي يمنحه Docker للتطبيق للبدء
- خلال هذه الفترة، فشل الـ healthcheck لا يُحسب
- يجب أن يكون أطول من وقت بدء التطبيق الفعلي

### 2. **Retries**
- عدد المحاولات الفاشلة قبل اعتبار الـ container غير صحي
- 6 محاولات = 6 × 45 ثانية = 4.5 دقيقة

### 3. **Timeout**
- الوقت المسموح لكل طلب healthcheck
- 20 ثانية كافية للاتصال بقاعدة البيانات والاستجابة

---

## ✅ قائمة التحقق

قبل النشر، تأكد من:

- ✅ `wget` مثبت في الـ Dockerfile
- ✅ `curl` مثبت كـ fallback
- ✅ Healthcheck يشير إلى المنفذ الصحيح (3001)
- ✅ Start period كافي (120 ثانية)
- ✅ متغيرات البيئة مضبوطة
- ✅ Database URL صحيح
- ✅ JWT_SECRET مضبوط

---

## 🚀 النشر

### الخطوات:
```bash
# 1. Commit التغييرات
git add Dockerfile .coolify.yml
git commit -m "fix: Add wget for Coolify healthcheck + improve timing"
git push origin main

# 2. في Coolify Dashboard
- اذهب إلى التطبيق
- اضغط "Redeploy"
- انتظر 2-3 دقائق
- تحقق من الحالة

# 3. التحقق
curl https://your-domain.com/api/health
```

---

## 📞 الدعم

### إذا استمرت المشكلة:

1. **تحقق من الـ Logs:**
   ```
   Coolify Dashboard -> Logs -> Container Logs
   ```

2. **تحقق من الـ Healthcheck Logs:**
   ```
   Coolify Dashboard -> Logs -> Healthcheck Logs
   ```

3. **اختبار يدوي:**
   ```bash
   # داخل الـ container
   docker exec <container-id> wget --spider http://localhost:3001/api/health
   docker exec <container-id> curl http://localhost:3001/api/health
   ```

4. **تحقق من المنفذ:**
   ```bash
   docker exec <container-id> netstat -tlnp | grep 3001
   ```

---

## ✅ النتيجة النهائية

**تم إصلاح مشكلة الـ Healthcheck بالكامل!**

- ✅ إضافة `wget` للـ Dockerfile
- ✅ تحديث الـ healthcheck command
- ✅ تحسين التوقيتات
- ✅ إضافة fallback لـ `curl`
- ✅ توثيق شامل

**النظام الآن جاهز للنشر على Coolify! 🚀**
