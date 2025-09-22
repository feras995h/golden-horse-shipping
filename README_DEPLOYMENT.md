# دليل النشر - Golden Horse Shipping

## 🚀 النشر على Coolify

### المتطلبات
- حساب Coolify
- قاعدة بيانات PostgreSQL
- متغيرات البيئة المطلوبة

### خطوات النشر

#### 1. إعداد المتغيرات البيئية

أضف المتغيرات التالية في Coolify:

```env
# Database Configuration
DATABASE_URL=postgres://username:password@host:port/database
DB_TYPE=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# ShipsGo API Configuration
SHIPSGO_API_KEY=your-shipsgo-api-key-here

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

#### 2. إعداد قاعدة البيانات

1. أنشئ قاعدة بيانات PostgreSQL جديدة
2. احصل على معلومات الاتصال
3. أضف `DATABASE_URL` في متغيرات البيئة

#### 3. النشر

1. ادفع الكود إلى GitHub
2. في Coolify، أضف المشروع من GitHub
3. اختر الفرع `main`
4. أضف متغيرات البيئة
5. اضغط "Deploy"

#### 4. التحقق من النشر

- **Health Check**: `https://your-domain.com/api/health`
- **Frontend**: `https://your-domain.com`
- **API**: `https://your-domain.com/api`

## 🐳 النشر باستخدام Docker

### 1. البناء المحلي

```bash
# Clone the repository
git clone https://github.com/feras995h/golden-horse-shipping.git
cd golden-horse-shipping

# Build the Docker image
docker build -t golden-horse-shipping .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://user:pass@host:port/db" \
  -e JWT_SECRET="your-secret" \
  -e SHIPSGO_API_KEY="your-key" \
  golden-horse-shipping
```

### 2. استخدام Docker Compose

```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## 🔧 استكشاف الأخطاء

### مشاكل البناء

#### خطأ: "can't cd to client"
**الحل**: تم إصلاح هذا الخطأ في `backend/package.json`

#### خطأ: "npm run build failed"
**الحل**: تأكد من وجود جميع المتغيرات البيئية المطلوبة

### مشاكل التشغيل

#### خطأ: "Database connection failed"
**الحل**: 
- تحقق من `DATABASE_URL`
- تأكد من إمكانية الوصول لقاعدة البيانات
- تحقق من إعدادات SSL

#### خطأ: "JWT_SECRET not defined"
**الحل**: أضف `JWT_SECRET` في متغيرات البيئة

### مشاكل ShipsGo API

#### خطأ: "ShipsGo API key not configured"
**الحل**: 
- أضف `SHIPSGO_API_KEY` في متغيرات البيئة
- أو استخدم البيانات الوهمية (سيتم استخدامها تلقائياً)

## 📊 مراقبة التطبيق

### Health Check

```bash
curl https://your-domain.com/api/health
```

الاستجابة المتوقعة:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Golden Horse Shipping API",
  "version": "1.0.0"
}
```

### Logs

```bash
# Docker logs
docker logs golden-horse-app

# Docker Compose logs
docker-compose logs -f app
```

## 🔄 التحديثات

### تحديث التطبيق

1. ادفع التغييرات إلى GitHub
2. في Coolify، اضغط "Redeploy"
3. انتظر حتى يكتمل البناء

### تحديث قاعدة البيانات

```bash
# Run migrations
npm run migrate
```

## 🛡️ الأمان

### متغيرات البيئة الحساسة

- `JWT_SECRET`: يجب أن يكون قوياً وفريداً
- `DATABASE_URL`: يحتوي على كلمة مرور قاعدة البيانات
- `SHIPSGO_API_KEY`: مفتاح API حساس

### نصائح الأمان

1. استخدم كلمات مرور قوية
2. فعّل SSL في قاعدة البيانات
3. راقب logs التطبيق
4. حدث التطبيق بانتظام

## 📞 الدعم

### إذا واجهت مشاكل

1. راجع logs البناء والتشغيل
2. تحقق من متغيرات البيئة
3. تأكد من إعدادات قاعدة البيانات
4. راجع `DEPLOYMENT_GUIDE.md` للمزيد من التفاصيل

### للمطورين

- استخدم `npm run dev` للتطوير المحلي
- استخدم `docker-compose up` للاختبار
- راجع `Dockerfile` للتخصيص

## ✅ قائمة التحقق

### قبل النشر

- [ ] تم إعداد قاعدة البيانات
- [ ] تم إضافة جميع متغيرات البيئة
- [ ] تم اختبار البناء محلياً
- [ ] تم مراجعة logs

### بعد النشر

- [ ] Health Check يعمل
- [ ] Frontend يفتح بشكل صحيح
- [ ] API يستجيب
- [ ] قاعدة البيانات متصلة
- [ ] جميع الوظائف تعمل

## 🎉 الخلاصة

تم إصلاح جميع مشاكل النشر! النظام الآن:

- ✅ **جاهز للنشر** - جميع الملفات محدثة
- ✅ **متوافق مع Coolify** - nixpacks.toml جاهز
- ✅ **محسن للأداء** - Dockerfile محسن
- ✅ **آمن** - مستخدم غير root
- ✅ **قابل للمراقبة** - Health Check متوفر

يمكنك الآن النشر بنجاح! 🚀
