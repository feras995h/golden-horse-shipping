# حل مشاكل النشر على الخادم المباشر

## تحليل المشكلة الحالية

بعد فحص ملفات الإعداد، تم تحديد عدة مشاكل في النشر على الخادم المباشر:

### 1. مشاكل في إعداد Docker Compose

**المشكلة الأساسية**: يوجد تضارب في ملفات Docker Compose:
- `docker-compose.yml` يحتوي على خدمة واحدة فقط (`app`)
- `docker-compose.prod.yml` يحتوي على خدمات منفصلة (`backend`, `frontend`, `nginx`)

### 2. مشاكل في متغيرات البيئة

**في ملف `.env` الحالي**:
```env
CORS_ORIGIN=http://localhost
FRONTEND_URL=http://localhost
```

هذه الإعدادات خاطئة للنشر المباشر.

### 3. مشاكل في إعداد Nginx

يوجد تكرار في إعداد Nginx في `docker-compose.prod.yml`.

## الحلول المطلوبة

### الحل الأول: إصلاح ملف docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: golden-horse-postgres
    environment:
      POSTGRES_DB: golden_horse_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: GoldenHorse2024!
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - golden-horse-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: golden-horse-backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://postgres:GoldenHorse2024!@postgres:5432/golden_horse_db
      JWT_SECRET: GoldenHorse-JWT-Secret-Key-2024-Production
      JWT_EXPIRES_IN: 24h
      CORS_ORIGIN: http://72.60.92.146,https://72.60.92.146
      FRONTEND_URL: http://72.60.92.146
    volumes:
      - backend_uploads:/app/uploads
    ports:
      - "3001:3001"
    networks:
      - golden-horse-network
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: golden-horse-frontend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: /api
      NEXT_PUBLIC_VPS_URL: http://72.60.92.146
    depends_on:
      - backend
    ports:
      - "3000:3000"
    networks:
      - golden-horse-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: golden-horse-nginx
    ports:
      - "80:80"
    volumes:
      - ./infra/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - golden-horse-network
    restart: unless-stopped

volumes:
  postgres_data:
  backend_uploads:

networks:
  golden-horse-network:
    driver: bridge
```

### الحل الثاني: تحديث ملف .env للإنتاج

```env
# Database Configuration
DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres

# JWT Configuration
JWT_SECRET=golden-horse-shipping-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration - تحديث للخادم المباشر
CORS_ORIGIN=http://72.60.92.146,https://72.60.92.146,http://localhost:3000
FRONTEND_URL=http://72.60.92.146

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# ShipsGo API Configuration
SHIPSGO_API_URL=https://shipsgo.com/api/v2
SHIPSGO_API_KEY=6eada10b-588f-4c36-9086-38009015b545
SHIPSGO_FALLBACK_TO_MOCK=false

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### الحل الثالث: إصلاح إعداد Nginx

تحديث ملف `infra/nginx.conf`:

```nginx
upstream frontend_service {
    server frontend:3000 max_fails=3 fail_timeout=30s;
}

upstream backend_service {
    server backend:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name 72.60.92.146;

    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend_service/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## خطوات التطبيق

### 1. إيقاف الخدمات الحالية
```bash
docker-compose -f docker-compose.prod.yml down
```

### 2. تحديث الملفات
- تحديث `docker-compose.prod.yml`
- تحديث `backend/.env`
- تحديث `infra/nginx.conf`

### 3. إعادة البناء والتشغيل
```bash
# بناء الحاويات من جديد
docker-compose -f docker-compose.prod.yml build --no-cache

# تشغيل الخدمات
docker-compose -f docker-compose.prod.yml up -d
```

### 4. التحقق من الحالة
```bash
# فحص حالة الحاويات
docker-compose -f docker-compose.prod.yml ps

# فحص السجلات
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

### 5. اختبار الاتصال
```bash
# اختبار الخادم الخلفي
curl http://72.60.92.146/api/health

# اختبار الواجهة الأمامية
curl http://72.60.92.146/
```

## استكشاف الأخطاء

### إذا استمرت مشكلة الاتصال:

1. **فحص المنافذ**:
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :3001
```

2. **فحص جدار الحماية**:
```bash
sudo ufw status
```

3. **فحص الشبكة الداخلية**:
```bash
docker network inspect golden-horse-network
```

4. **فحص قاعدة البيانات**:
```bash
docker-compose -f docker-compose.prod.yml exec backend npm run typeorm:check
```

## ملاحظات مهمة

- تأكد من أن عنوان IP `72.60.92.146` صحيح
- تأكد من أن قاعدة البيانات متاحة على المنفذ 5433
- في حالة استخدام domain name، استبدل IP بالدومين
- تأكد من أن جميع المنافذ مفتوحة في جدار الحماية

## الحالة المتوقعة بعد التطبيق

✅ الواجهة الأمامية متاحة على: `http://72.60.92.146`
✅ API الخادم الخلفي متاح على: `http://72.60.92.146/api`
✅ تسجيل الدخول يعمل بشكل طبيعي
✅ جميع الوظائف تعمل كما هو متوقع