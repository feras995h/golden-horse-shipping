# 🚀 دليل النشر - Golden Horse Shipping

## 📋 جدول المحتويات
1. [المشكلة والحل](#المشكلة-والحل)
2. [الملفات المهمة](#الملفات-المهمة)
3. [خطوات النشر السريعة](#خطوات-النشر-السريعة)
4. [التحقق من النجاح](#التحقق-من-النجاح)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 📍 المشكلة والحل

### ❌ المشكلة
```
Error: getaddrinfo EAI_AGAIN base
[TypeOrmModule] Unable to connect to the database
```

### ✅ الحل
متغيرات البيئة غير محددة بشكل صحيح في Coolify. النظام يحاول الاتصال بمضيف يسمى "base" بدلاً من قاعدة البيانات الفعلية.

### 🎯 الإصلاحات المطبقة
1. ✅ تحديث `backend/src/config/database.config.ts` لإعطاء أولوية للمتغيرات الفردية
2. ✅ إضافة رسائل تصحيح شاملة للتتبع
3. ✅ اختبار الاتصال بقاعدة البيانات بنجاح
4. ✅ توثيق كامل للإعدادات المطلوبة

---

## 📁 الملفات المهمة

### للبدء السريع (ابدأ هنا! 👈)
- **`خطوات-سريعة-للنشر.txt`** - دليل سريع بالعربية (3 دقائق)
- **`RECOMMENDED_ENV_VARS.txt`** - المتغيرات الموصى بها (نسخ ولصق مباشر)

### للتفاصيل الكاملة
- **`DATABASE_CONNECTION_TEST_RESULTS.md`** - نتائج اختبار الاتصال بقاعدة البيانات
- **`DEPLOYMENT_FIXES_SUMMARY.md`** - ملخص شامل للإصلاحات
- **`COOLIFY_DEPLOYMENT_GUIDE.md`** - دليل نشر تفصيلي

### ملفات إضافية
- **`coolify-env-variables.txt`** - قائمة شاملة بجميع المتغيرات
- **`backend/test-db-connection.js`** - سكريبت لاختبار الاتصال

---

## ⚡ خطوات النشر السريعة

### 1️⃣ افتح Coolify
```
Dashboard → Your Project → Environment Variables
```

### 2️⃣ احذف المتغيرات القديمة
احذف أي متغيرات قديمة خاصة بقاعدة البيانات، بالأخص:
- DB_SSL
- DB_SSL_REJECT_UNAUTHORIZED
- أي متغير يحتوي على "base"

### 3️⃣ أضف المتغيرات الجديدة
انسخ المتغيرات من ملف **`RECOMMENDED_ENV_VARS.txt`**

أو أضف هذه المتغيرات الأساسية:
```bash
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
NODE_ENV=production
PORT=3000
BACKEND_PORT=3001
FRONTEND_PORT=3000
DB_SYNCHRONIZE=true
JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This
JWT_EXPIRES_IN=7d
```

للقائمة الكاملة، راجع `RECOMMENDED_ENV_VARS.txt`.

### 4️⃣ احفظ وأعد النشر
1. انقر **Save**
2. انقر **Redeploy**
3. انتظر اكتمال البناء (3-5 دقائق)

---

## ✅ التحقق من النجاح

### في سجلات Coolify، يجب أن ترى:

**✅ رسائل النجاح:**
```
🔍 Database Configuration Debug:
  - DATABASE_URL: postgres://postgres:...
  - Is PostgreSQL: true
✅ Using DATABASE_URL

[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized +29ms
[Nest] LOG [InstanceLoader] PassportModule dependencies initialized +0ms

✓ Ready in XXXms
- Local: http://localhost:3000
```

**❌ لا يجب أن ترى:**
```
Error: getaddrinfo EAI_AGAIN base
Unable to connect to the database
The server does not support SSL connections
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا يزال خطأ "base" يظهر
**الأسباب المحتملة:**
- المتغيرات غير محددة في Coolify
- المتغيرات تحتوي على مسافات قبل/بعد القيم

**الحل:**
1. احذف جميع متغيرات قاعدة البيانات
2. أعد إضافة `DATABASE_URL` فقط
3. تأكد من عدم وجود مسافات
4. أعد النشر

### المشكلة: "Unable to connect to the database"
**الأسباب المحتملة:**
- البورت 5433 غير متاح
- جدار الحماية يمنع الاتصال
- كلمة المرور خاطئة

**الحل:**
1. تحقق من أن البورت 5433 مفتوح
2. جرب الاتصال من Coolify server:
   ```bash
   psql "postgres://postgres:PASSWORD@72.60.92.146:5433/postgres"
   ```
3. تحقق من صحة بيانات الاعتماد

### المشكلة: "The server does not support SSL connections"
**السبب:**
إضافة متغيرات SSL بالخطأ

**الحل:**
احذف هذه المتغيرات إذا كانت موجودة:
- DB_SSL
- DB_SSL_REJECT_UNAUTHORIZED

قاعدة البيانات لا تدعم SSL، و `DATABASE_URL` يعمل بدونها بشكل مثالي.

### المشكلة: الجداول غير موجودة
**السبب:**
`DB_SYNCHRONIZE` غير محدد أو = false

**الحل:**
في النشر الأول، استخدم:
```bash
DB_SYNCHRONIZE=true
```

بعد النشر الأول، غيّره إلى:
```bash
DB_SYNCHRONIZE=false
```

---

## 📊 نتائج الاختبار

تم اختبار الاتصال بقاعدة البيانات باستخدام سكريبت خاص:

```bash
node backend/test-db-connection.js
```

**النتائج:**
- ✅ DATABASE_URL: **نجح** ← استخدم هذا
- ❌ متغيرات منفصلة مع SSL: فشل (SSL غير مدعوم)

**التوصية النهائية:** استخدم `DATABASE_URL` فقط.

راجع `DATABASE_CONNECTION_TEST_RESULTS.md` للتفاصيل الكاملة.

---

## ⚠️ ملاحظات مهمة

### 1. DATABASE_URL هو الحل الموصى به
```bash
✅ DATABASE_URL=postgres://postgres:PASSWORD@72.60.92.146:5433/postgres
```

### 2. لا تستخدم SSL
```bash
❌ DB_SSL=true  # خطأ - الخادم لا يدعم SSL
❌ DB_SSL_REJECT_UNAUTHORIZED=false  # خطأ - غير مطلوب
```

### 3. DB_SYNCHRONIZE للنشر الأول فقط
```bash
✅ DB_SYNCHRONIZE=true   # النشر الأول - ينشئ الجداول
✅ DB_SYNCHRONIZE=false  # الإنتاج - يحافظ على البيانات
```

### 4. غيّر JWT_SECRET
```bash
⚠️ JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This
```
غيّره إلى قيمة عشوائية وآمنة في الإنتاج.

---

## 🎯 الخلاصة

| العنصر | القيمة |
|--------|--------|
| **قاعدة البيانات** | PostgreSQL 17.6 |
| **المضيف** | 72.60.92.146:5433 |
| **SSL** | غير مدعوم (ولا يُحتاج) |
| **الطريقة الموصى بها** | DATABASE_URL |
| **الحالة** | ✅ تم الاختبار وجاهز للنشر |

---

## 📞 الدعم الفني

### اختبار الاتصال محلياً
```bash
cd backend
node test-db-connection.js
```

### إنشاء مستخدم إداري
```bash
cd backend
node create-admin-postgres.js
```

**بيانات الدخول الافتراضية:**
- Username: `admin`
- Password: `admin123`

---

## 🔄 بعد النشر الناجح

1. ✅ اختبر تسجيل الدخول كمسؤول
2. ✅ غيّر `DB_SYNCHRONIZE` إلى `false`
3. ✅ غيّر `JWT_SECRET` إلى قيمة آمنة
4. ✅ حدّث `CORS_ORIGIN` لنطاقك المحدد
5. ✅ أنشئ نسخة احتياطية من قاعدة البيانات

---

## 📚 الموارد

- **التوثيق الكامل:** `DEPLOYMENT_FIXES_SUMMARY.md`
- **نتائج الاختبار:** `DATABASE_CONNECTION_TEST_RESULTS.md`
- **دليل Coolify:** `COOLIFY_DEPLOYMENT_GUIDE.md`
- **متغيرات البيئة:** `RECOMMENDED_ENV_VARS.txt`

---

**آخر تحديث:** 2 أكتوبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للنشر على Coolify

---

## 🎉 شكراً لاستخدام Golden Horse Shipping!

إذا واجهت أي مشاكل، راجع الملفات المذكورة أعلاه أو افحص سجلات Coolify.

