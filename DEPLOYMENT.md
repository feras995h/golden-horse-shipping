# دليل الرفع والنشر - Golden Horse Shipping

## نظرة عامة
هذا الدليل يوضح كيفية رفع الموقع للإنتاج مع قاعدة بيانات PostgreSQL سحابية.

## المتطلبات المسبقة
- خادم Ubuntu/Debian مع Docker و Docker Compose
- قاعدة بيانات PostgreSQL سحابية (AWS RDS, Google Cloud SQL, إلخ)
- دومين أو IP عام

## خطوات الرفع

### 1. إعداد قاعدة البيانات السحابية
```bash
# أنشئ قاعدة بيانات PostgreSQL على أحد الخدمات السحابية:
# - AWS RDS PostgreSQL
# - Google Cloud SQL
# - Azure Database for PostgreSQL
# - أو أي خدمة أخرى

# احتفظ بهذه المعلومات:
# - DB_HOST: عنوان الخادم
# - DB_PORT: المنفذ (عادة 5432)
# - DB_USERNAME: اسم المستخدم
# - DB_PASSWORD: كلمة المرور
# - DB_NAME: اسم قاعدة البيانات
```

### 2. تحضير الخادم
```bash
# اتصل بالخادم عبر SSH
ssh user@your-server-ip

# تثبيت Docker و Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# إضافة المستخدم إلى مجموعة docker
sudo usermod -aG docker $USER

# إعادة تسجيل الدخول
exit
ssh user@your-server-ip
```

### 3. رفع الملفات
```bash
# رفع المشروع إلى الخادم
scp -r /path/to/project user@your-server:/path/to/project

# أو استخدم Git
git clone your-repo-url
cd golden-horse-shipping
```

### 4. إعداد متغيرات البيئة
```bash
cd backend

# نسخ ملف البيئة
cp .env.prod.example .env

# تحرير المتغيرات (استبدل القيم بالحقيقية)
nano .env
```

**خيار 1: استخدام DATABASE_URL (موصى به)**
```env
# Database - Cloud PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DB_SYNCHRONIZE=false

# JWT
JWT_SECRET=your-production-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS - استبدل بعنوان دومينك
FRONTEND_URL=https://yourdomain.com

# Uploads
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# API Keys (اختياري)
AIS_API_KEY=
AIS_API_URL=https://api.vesselfinder.com/

# Email (اختياري)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**خيار 2: استخدام المتغيرات المنفصلة**
```env
# Database - Cloud PostgreSQL
DB_TYPE=postgres
DB_HOST=your-cloud-postgres-host.com
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SYNCHRONIZE=false

# JWT
JWT_SECRET=your-production-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS - استبدل بعنوان دومينك
FRONTEND_URL=https://yourdomain.com

# Uploads
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# API Keys (اختياري)
AIS_API_KEY=
AIS_API_URL=https://api.vesselfinder.com/

# Email (اختياري)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 5. اختبار الاتصال بقاعدة البيانات
```bash
cd backend
npm install
npm run test-db
```

### 6. تشغيل الـ Migrations
```bash
cd backend
npm run migration:run-prod
```

### 7. بناء وتشغيل الحاويات
```bash
# في المجلد الجذر للمشروع
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 8. التحقق من التشغيل
```bash
# مراقبة السجلات
docker-compose -f docker-compose.prod.yml logs -f

# التحقق من حالة الحاويات
docker-compose -f docker-compose.prod.yml ps
```

## الوصول للموقع

بعد الرفع الناجح، سيكون الموقع متاحاً على:

- **الموقع الأمامي**: `http://your-server-ip`
- **API الخلفي**: `http://your-server-ip:3001/api`
- **توثيق API**: `http://your-server-ip:3001/api/docs`

## إعداد Nginx (اختياري للدومين)

إذا كان لديك دومين، يمكنك إعداد Nginx كـ Reverse Proxy:

```bash
# تثبيت Nginx
sudo apt install nginx

# إنشاء إعداد الموقع
sudo nano /etc/nginx/sites-available/golden-horse

# محتوى الملف:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/golden-horse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## إدارة الموقع

### إعادة التشغيل
```bash
docker-compose -f docker-compose.prod.yml restart
```

### تحديث الكود
```bash
# سحب التحديثات
git pull

# إعادة البناء والتشغيل
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات (من خدمة السحابة)
# نسخ احتياطي للملفات المرفوعة
docker exec golden-horse-backend tar czf /tmp/uploads-backup.tar.gz /app/uploads
docker cp golden-horse-backend:/tmp/uploads-backup.tar.gz ./
```

## استكشاف الأخطاء

### مشاكل شائعة:

1. **فشل الاتصال بقاعدة البيانات**
   - تأكد من صحة بيانات الاتصال
   - تحقق من إعدادات الـ Firewall
   - تأكد من تفعيل SSL إذا لزم الأمر

2. **فشل البناء**
   - تحقق من وجود جميع المتغيرات البيئية
   - تأكد من تثبيت Docker بشكل صحيح

3. **مشاكل الأداء**
   - تحقق من موارد الخادم
   - راقب استخدام الذاكرة والمعالج

### مراجعة السجلات
```bash
# سجلات الحاويات
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# سجلات Nginx
sudo tail -f /var/log/nginx/error.log
```

## الأمان

- غير كلمات المرور الافتراضية
- استخدم شهادات SSL للإنتاج
- حدث النظام بانتظام
- راقب السجلات للكشف عن النشاط المشبوه

## الدعم

للمساعدة أو الاستفسارات، راجع:
- ملف README.md للتفاصيل الفنية
- توثيق API في `/api/docs`
- سجلات Docker لاستكشاف الأخطاء
