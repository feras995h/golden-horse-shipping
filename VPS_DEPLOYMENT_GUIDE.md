# دليل نشر التطبيق على VPS

## المشكلة الحالية
عند تسجيل الدخول، يظهر خطأ `ERR_CONNECTION_REFUSED` لأن الواجهة الأمامية تحاول الاتصال بـ `http://localhost:3000/api` بدلاً من الخادم الخلفي الصحيح.

## الحلول المطلوبة

### 1. إعداد Docker Compose للإنتاج

تم تحديث ملف `docker-compose.prod.yml` لاستخدام reverse proxy:

```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: /api  # استخدام reverse proxy بدلاً من الاتصال المباشر
```

### 2. إعداد متغيرات البيئة

#### للخادم الخلفي (Backend)
أنشئ ملف `.env` في مجلد `backend` مع المحتوى التالي:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
UPLOAD_PATH=/app/uploads
```

#### للواجهة الأمامية (Frontend)
في Docker Compose، تم تعيين:
```env
NEXT_PUBLIC_API_URL=/api
```

### 3. خطوات النشر على VPS

#### الخطوة 1: رفع الملفات
```bash
# رفع المشروع إلى VPS
scp -r ./project-folder user@your-vps-ip:/path/to/project
```

#### الخطوة 2: إعداد البيئة
```bash
# الدخول إلى VPS
ssh user@your-vps-ip

# الانتقال إلى مجلد المشروع
cd /path/to/project

# إنشاء ملف .env للخادم الخلفي
cp backend/.env.prod.example backend/.env
# تحرير الملف وإضافة القيم الصحيحة
nano backend/.env
```

#### الخطوة 3: بناء وتشغيل الحاويات
```bash
# بناء الحاويات
docker-compose -f docker-compose.prod.yml build

# تشغيل الخدمات
docker-compose -f docker-compose.prod.yml up -d
```

#### الخطوة 4: التحقق من حالة الخدمات
```bash
# التحقق من حالة الحاويات
docker-compose -f docker-compose.prod.yml ps

# عرض سجلات الأخطاء
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs reverse-proxy
```

### 4. إعداد قاعدة البيانات

#### إذا كنت تستخدم PostgreSQL خارجي:
```bash
# تشغيل migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
```

#### إذا كنت تستخدم SQLite:
```env
# في ملف .env
DATABASE_URL=sqlite:./database.sqlite
```

### 5. إعداد Nginx (إضافي)

إذا كنت تريد استخدام Nginx منفصل:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. استكشاف الأخطاء

#### فحص الاتصال بالخادم الخلفي:
```bash
# من داخل VPS
curl http://localhost/api/health
```

#### فحص سجلات الأخطاء:
```bash
# سجلات الخادم الخلفي
docker logs golden-horse-backend

# سجلات الواجهة الأمامية
docker logs golden-horse-frontend

# سجلات Nginx
docker logs golden-horse-proxy
```

#### فحص الشبكة:
```bash
# التحقق من الشبكة الداخلية
docker network ls
docker network inspect golden-horse-network
```

### 7. الأمان

#### إعداد Firewall:
```bash
# السماح بالمنافذ المطلوبة فقط
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable
```

#### إعداد SSL (اختياري):
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d yourdomain.com
```

### 8. المراقبة

#### فحص استخدام الموارد:
```bash
# استخدام الذاكرة والمعالج
docker stats

# مساحة القرص
df -h
```

#### إعداد النسخ الاحتياطي:
```bash
# نسخ احتياطي لقاعدة البيانات
docker-compose -f docker-compose.prod.yml exec backend npm run backup
```

## الملاحظات المهمة

1. **تأكد من إعداد متغيرات البيئة بشكل صحيح**
2. **استخدم HTTPS في الإنتاج**
3. **قم بعمل نسخ احتياطية منتظمة**
4. **راقب سجلات الأخطاء باستمرار**
5. **تأكد من تحديث النظام والحاويات بانتظام**

## الدعم

إذا واجهت مشاكل، تحقق من:
- سجلات الحاويات
- إعدادات الشبكة
- متغيرات البيئة
- حالة قاعدة البيانات