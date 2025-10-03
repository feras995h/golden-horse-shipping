# دليل النشر على Coolify - Golden Horse Shipping

## 🔍 تشخيص المشكلة

**الخطأ الحالي:**
```
Error: getaddrinfo EAI_AGAIN base
```

**السبب:** التطبيق يحاول الاتصال بمضيف يسمى "base" بدلاً من عنوان قاعدة البيانات الصحيح `72.60.92.146`.

**الحل:** متغيرات البيئة غير محددة بشكل صحيح في Coolify.

---

## ✅ الحل: إعداد متغيرات البيئة

### خطوات الإعداد في Coolify:

1. **افتح مشروعك في Coolify**
2. **اذهب إلى قسم "Environment Variables"**
3. **أضف المتغيرات التالية:**

---

### 📋 قائمة المتغيرات المطلوبة

انسخ والصق كل متغير من المتغيرات التالية في Coolify:

#### 🔧 إعدادات الخادم
```
NODE_ENV=production
PORT=3000
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

#### 🗄️ إعدادات قاعدة البيانات (الطريقة الأولى - استخدام DATABASE_URL)
```
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
```

#### 🗄️ إعدادات قاعدة البيانات (الطريقة الثانية - متغيرات منفصلة - موصى بها)
```
DB_TYPE=postgres
DB_HOST=72.60.92.146
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l
DB_NAME=postgres
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

**⚠️ مهم:** استخدم **الطريقة الثانية (متغيرات منفصلة)** لأنها أكثر موثوقية في Coolify.

#### 🔐 إعدادات JWT
```
JWT_SECRET=GoldenHorse-JWT-Secret-Key-2024-Production-Change-This-To-Very-Secure-Random-String
JWT_EXPIRES_IN=7d
```

#### 🌐 إعدادات CORS والروابط
```
CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000
```

#### 📱 إعدادات التطبيق
```
APP_NAME=Golden Horse Shipping
APP_VERSION=1.0.0
DEFAULT_LANGUAGE=ar
UPLOAD_PATH=/app/uploads
```

#### 🚢 إعدادات ShipsGo API
```
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=6eada10b-fcd9-4ab8-ba19-3e2cb33fc1fa
SHIPSGO_USE_MOCK=false
```

#### ⚡ إعدادات إضافية
```
NEXT_TELEMETRY_DISABLED=1
```

---

## 🚀 خطوات النشر

### 1. إضافة المتغيرات
- في Coolify، اذهب إلى **Environment Variables**
- أضف **جميع** المتغيرات المذكورة أعلاه
- **لا تترك أي متغير فارغاً**
- **احذف أي متغيرات قديمة** قد تتعارض (مثل متغير قد يحتوي على "base")

### 2. حفظ التغييرات
- انقر على **Save** أو **Update**

### 3. إعادة النشر
- انقر على **Redeploy** أو **Deploy**
- انتظر حتى يكتمل البناء

### 4. التحقق من السجلات
بعد النشر، افتح سجلات الحاوية. يجب أن ترى:

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
[Nest] X  - XX/XX/XXXX, XX:XX:XX XX     LOG [NestFactory] Starting Nest application...
[Nest] X  - XX/XX/XXXX, XX:XX:XX XX     LOG [InstanceLoader] TypeOrmModule dependencies initialized
```

**يجب ألا ترى:**
```
Error: getaddrinfo EAI_AGAIN base
```

---

## ⚠️ نصائح مهمة

### 1. DB_SYNCHRONIZE
- **في النشر الأول:** استخدم `DB_SYNCHRONIZE=true` لإنشاء الجداول تلقائياً
- **بعد النشر الأول:** غيّر إلى `DB_SYNCHRONIZE=false` لتجنب فقدان البيانات

### 2. التحقق من الاتصال بقاعدة البيانات
تأكد من:
- ✅ البورت **5433** مفتوح للاتصالات من Coolify
- ✅ عنوان IP **72.60.92.146** قابل للوصول من خادم Coolify
- ✅ جدار الحماية يسمح بالاتصالات
- ✅ بيانات الاعتماد صحيحة

### 3. استكشاف الأخطاء
إذا استمرت المشكلة:

#### أ) تحقق من المتغيرات
```bash
# في سجلات Coolify، ابحث عن:
🔍 Database Configuration Debug:
  - DB_HOST: 72.60.92.146  # يجب أن يكون هذا العنوان وليس "base"
```

#### ب) اختبر الاتصال بقاعدة البيانات
يمكنك استخدام أداة مثل **pgAdmin** أو **psql** للتحقق من الاتصال:
```bash
psql "postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres"
```

#### ج) تحقق من docker-compose.yml
تأكد من أن ملف `docker-compose.yml` يستخدم profile `single-app` أو `coolify`:
```yaml
profiles:
  - single-app
  - coolify
```

---

## 📝 ملاحظات إضافية

### الفرق بين الطريقتين:

**طريقة DATABASE_URL:**
- ✅ بسيطة وسريعة
- ❌ قد لا تعمل في بعض إعدادات Coolify
- ❌ قد يتم تحليلها بشكل خاطئ

**طريقة المتغيرات المنفصلة:**
- ✅ أكثر موثوقية
- ✅ تعمل في معظم الحالات
- ✅ سهلة التحديث والتعديل
- ✅ **موصى بها**

---

## 🎯 الخلاصة

المشكلة الرئيسية هي أن **متغيرات قاعدة البيانات غير محددة بشكل صحيح**، مما يجعل التطبيق يحاول الاتصال بمضيف يسمى "base" (قيمة افتراضية).

**الحل:**
1. أضف جميع المتغيرات المذكورة أعلاه في Coolify
2. استخدم المتغيرات المنفصلة (DB_HOST, DB_PORT, إلخ)
3. أعد النشر
4. تحقق من السجلات

---

## 📞 الدعم

إذا واجهت أي مشاكل بعد تطبيق هذه التغييرات، تحقق من:
1. سجلات الحاوية في Coolify
2. رسائل التصحيح التي تبدأ بـ `🔍 Database Configuration Debug:`
3. تأكد من أن جميع المتغيرات مضافة بشكل صحيح

---

**آخر تحديث:** 2 أكتوبر 2025