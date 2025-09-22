# دليل النشر - Golden Horse Shipping

## نظرة عامة

تم إصلاح مشاكل النشر وإعداد النظام للنشر على Coolify أو أي منصة أخرى.

## المشاكل التي تم إصلاحها

### 1. **مشكلة سكريبت البناء**:
- ✅ تم إصلاح `backend/package.json` - إزالة المراجع لمجلدات `client` و `server` غير الموجودة
- ✅ تم تحديث سكريبتات البناء لتكون متوافقة مع NestJS
- ✅ تم إصلاح `package.json` الرئيسي لبناء Backend و Frontend بشكل صحيح

### 2. **ملفات النشر**:
- ✅ تم إنشاء `nixpacks.toml` لتحسين عملية النشر
- ✅ تم إنشاء `Dockerfile` محسن للبناء المتكامل
- ✅ تم إنشاء `.dockerignore` لتحسين الأداء
- ✅ تم تحديث `docker-compose.yml` للبناء الموحد

## الملفات المحدثة

### 1. **backend/package.json**:
```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:prod": "node dist/main"
  }
}
```

### 2. **package.json الرئيسي**:
```json
{
  "scripts": {
    "build": "npm run build --prefix backend && npm run build --prefix frontend",
    "start": "npm run start:prod --prefix backend"
  }
}
```

### 3. **nixpacks.toml**:
```toml
[phases.setup]
nixPkgs = ["nodejs_22", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"

[variables]
NODE_ENV = "production"
```

### 4. **Dockerfile**:
- بناء متعدد المراحل
- تحسين الأداء والأمان
- دعم Health Check
- مستخدم غير root

## متغيرات البيئة المطلوبة

### 1. **قاعدة البيانات**:
```env
DATABASE_URL=postgres://username:password@host:port/database
DB_TYPE=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 2. **JWT**:
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 3. **التطبيق**:
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
```

### 4. **ShipsGo API**:
```env
SHIPSGO_API_KEY=your-shipsgo-api-key
```

## خطوات النشر

### 1. **إعداد المتغيرات**:
- أضف متغيرات البيئة في Coolify
- تأكد من إعداد قاعدة البيانات PostgreSQL
- أضف `SHIPSGO_API_KEY` إذا كنت تستخدم API حقيقي

### 2. **النشر**:
- ادفع التغييرات إلى GitHub
- Coolify سيقوم ببناء التطبيق تلقائياً
- انتظر حتى يكتمل البناء

### 3. **التحقق**:
- تحقق من Health Check: `https://your-domain.com/api/health`
- تحقق من الواجهة الأمامية: `https://your-domain.com`
- تحقق من API: `https://your-domain.com/api`

## استكشاف الأخطاء

### 1. **مشاكل البناء**:
- تحقق من logs البناء في Coolify
- تأكد من أن جميع المتغيرات موجودة
- تحقق من اتصال قاعدة البيانات

### 2. **مشاكل التشغيل**:
- تحقق من Health Check endpoint
- راجع logs التطبيق
- تأكد من إعدادات قاعدة البيانات

### 3. **مشاكل قاعدة البيانات**:
- تأكد من اتصال قاعدة البيانات
- تحقق من صحة `DATABASE_URL`
- تأكد من أن قاعدة البيانات فارغة (تم إفراغها)

## الميزات الجديدة

### 1. **Health Check**:
- Endpoint: `/api/health`
- يعرض حالة التطبيق
- يستخدم في Docker Health Check

### 2. **تحسينات الأمان**:
- مستخدم غير root في Docker
- متغيرات بيئة آمنة
- تحقق من الصحة

### 3. **تحسينات الأداء**:
- بناء متعدد المراحل
- تحسين cache
- تحسين حجم الصورة

## الدعم

### 1. **إذا واجهت مشاكل**:
- راجع logs البناء
- تحقق من متغيرات البيئة
- تأكد من إعدادات قاعدة البيانات

### 2. **للمطورين**:
- استخدم `docker-compose up` للتطوير المحلي
- استخدم `npm run build` لاختبار البناء
- راجع `Dockerfile` للتخصيص

## الخلاصة

تم إصلاح جميع مشاكل النشر! النظام الآن:

- ✅ **جاهز للنشر** - جميع الملفات محدثة
- ✅ **متوافق مع Coolify** - nixpacks.toml جاهز
- ✅ **محسن للأداء** - Dockerfile محسن
- ✅ **آمن** - مستخدم غير root
- ✅ **قابل للمراقبة** - Health Check متوفر

يمكنك الآن النشر بنجاح! 🚀
