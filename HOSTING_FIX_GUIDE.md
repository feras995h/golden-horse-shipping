# دليل إصلاح مشكلة تسجيل الدخول على الاستضافة
# Hosting Login Issue Fix Guide

## 🚨 المشكلة / Issue

مشكلة تسجيل الدخول على الخادم المستضاف وليس محلياً.
Login issue on the hosting server, not locally.

## 🔍 التشخيص المطلوب / Required Diagnosis

### 1. فحص بيئة الاستضافة / Check Hosting Environment

```bash
# فحص حالة الخدمات
# Check services status
docker ps -a

# فحص السجلات
# Check logs
docker logs golden-horse-backend
docker logs golden-horse-frontend
docker logs golden-horse-nginx
```

### 2. فحص قاعدة البيانات على الاستضافة / Check Hosting Database

```bash
# الاتصال بقاعدة البيانات
# Connect to database
docker exec -it golden-horse-backend node check-admin-user.js

# أو مباشرة
# Or directly
docker exec -it postgres-container psql -U postgres -d golden_horse_db -c "SELECT * FROM users WHERE role = 'ADMIN';"
```

### 3. فحص متغيرات البيئة / Check Environment Variables

```bash
# فحص متغيرات البيئة في الحاوية
# Check environment variables in container
docker exec -it golden-horse-backend env | grep -E "(DATABASE|JWT|CORS|API)"
```

## 🛠️ الحلول المحتملة / Potential Solutions

### الحل الأول: إنشاء مستخدم إداري على الاستضافة / Solution 1: Create Admin User on Hosting

```bash
# تشغيل سكريبت إنشاء المدير
# Run admin creation script
docker exec -it golden-horse-backend node create-admin.js

# أو إنشاء مستخدم مباشرة في قاعدة البيانات
# Or create user directly in database
docker exec -it postgres-container psql -U postgres -d golden_horse_db -c "
INSERT INTO users (id, username, email, password, role, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@goldenhorse-shipping.com',
  '\$2b\$10\$rQZ9vZ9Z9Z9Z9Z9Z9Z9Z9O',
  'ADMIN',
  NOW(),
  NOW()
);"
```

### الحل الثاني: إعادة نشر مع إعدادات صحيحة / Solution 2: Redeploy with Correct Settings

```bash
# إيقاف الخدمات الحالية
# Stop current services
docker-compose down

# تحديث متغيرات البيئة
# Update environment variables
cp .env.example .env

# تحديث عنوان الخادم في .env
# Update server address in .env
# NEXT_PUBLIC_VPS_URL=https://your-domain.com
# CORS_ORIGIN=https://your-domain.com

# إعادة النشر
# Redeploy
docker-compose up -d --build
```

### الحل الثالث: إصلاح إعدادات CORS / Solution 3: Fix CORS Settings

```bash
# تحديث إعدادات CORS في .env
# Update CORS settings in .env
CORS_ORIGIN=https://your-domain.com,http://your-domain.com,https://www.your-domain.com

# إعادة تشغيل الخادم الخلفي
# Restart backend
docker-compose restart backend
```

## 📋 خطوات الإصلاح التفصيلية / Detailed Fix Steps

### الخطوة 1: تشخيص المشكلة / Step 1: Diagnose the Issue

```bash
# 1. فحص حالة الحاويات
# 1. Check container status
docker ps -a

# 2. فحص سجلات الخادم الخلفي
# 2. Check backend logs
docker logs golden-horse-backend --tail=50

# 3. فحص سجلات قاعدة البيانات
# 3. Check database logs
docker logs postgres-container --tail=20

# 4. اختبار الاتصال بـ API
# 4. Test API connection
curl -X GET https://your-domain.com/api/health
```

### الخطوة 2: إنشاء مستخدم إداري / Step 2: Create Admin User

```bash
# الطريقة الأولى: استخدام السكريبت
# Method 1: Using script
docker exec -it golden-horse-backend node create-admin.js

# الطريقة الثانية: إنشاء مباشر
# Method 2: Direct creation
docker exec -it golden-horse-backend node -e "
const bcrypt = require('bcrypt');
const password = bcrypt.hashSync('admin123', 10);
console.log('Hashed password:', password);
"

# ثم إدراج في قاعدة البيانات
# Then insert into database
docker exec -it postgres-container psql -U postgres -d golden_horse_db -c "
INSERT INTO users (id, username, email, password, role, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@goldenhorse-shipping.com',
  'HASHED_PASSWORD_HERE',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;"
```

### الخطوة 3: اختبار تسجيل الدخول / Step 3: Test Login

```bash
# اختبار API مباشرة
# Test API directly
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# يجب أن تحصل على استجابة تحتوي على access_token
# Should get response containing access_token
```

## 🔧 إصلاحات سريعة حسب نوع الاستضافة / Quick Fixes by Hosting Type

### Coolify

```bash
# إعادة نشر الخدمة
# Redeploy service
# في لوحة Coolify، اضغط على "Deploy"

# أو عبر CLI
# Or via CLI
coolify deploy --project-id=your-project-id
```

### VPS مع Docker

```bash
# تسجيل الدخول للخادم
# SSH to server
ssh user@your-server-ip

# الانتقال لمجلد المشروع
# Navigate to project folder
cd /path/to/your/project

# إيقاف الخدمات
# Stop services
docker-compose down

# إنشاء مستخدم إداري
# Create admin user
docker-compose run --rm backend node create-admin.js

# إعادة تشغيل الخدمات
# Restart services
docker-compose up -d
```

### Railway/Heroku

```bash
# استخدام CLI الخاص بالمنصة
# Use platform-specific CLI

# Railway
railway run node create-admin.js

# Heroku
heroku run node create-admin.js -a your-app-name
```

## 🚨 حلول الطوارئ / Emergency Solutions

### إذا لم تعمل الحلول السابقة / If Previous Solutions Don't Work

```bash
# 1. إعادة تعيين قاعدة البيانات بالكامل
# 1. Reset entire database
docker exec -it postgres-container psql -U postgres -d golden_horse_db -c "
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
"

# 2. إعادة تشغيل migration
# 2. Re-run migrations
docker exec -it golden-horse-backend npm run migration:run

# 3. إنشاء مستخدم إداري جديد
# 3. Create new admin user
docker exec -it golden-horse-backend node create-admin.js
```

### إعادة النشر الكامل / Complete Redeployment

```bash
# 1. حفظ البيانات المهمة (إن وجدت)
# 1. Backup important data (if any)
docker exec -it postgres-container pg_dump -U postgres golden_horse_db > backup.sql

# 2. إزالة كل شيء
# 2. Remove everything
docker-compose down -v
docker system prune -a

# 3. إعادة النشر
# 3. Redeploy
git pull origin main
docker-compose up -d --build

# 4. إنشاء مستخدم إداري
# 4. Create admin user
docker-compose exec backend node create-admin.js
```

## 📞 معلومات الدعم / Support Information

### بيانات تسجيل الدخول الافتراضية / Default Login Credentials

```
اسم المستخدم / Username: admin
كلمة المرور / Password: admin123
البريد الإلكتروني / Email: admin@goldenhorse-shipping.com
```

### أوامر مفيدة للتشخيص / Useful Diagnostic Commands

```bash
# فحص حالة جميع الحاويات
# Check all containers status
docker ps -a

# فحص استخدام الموارد
# Check resource usage
docker stats

# فحص الشبكة
# Check network
docker network ls
docker network inspect golden-horse-network

# فحص الأحجام
# Check volumes
docker volume ls
docker volume inspect golden-horse-db-data
```

### ملفات السجلات المهمة / Important Log Files

```bash
# سجلات الخادم الخلفي
# Backend logs
docker logs golden-horse-backend

# سجلات قاعدة البيانات
# Database logs
docker logs postgres-container

# سجلات Nginx
# Nginx logs
docker logs golden-horse-nginx

# سجلات النظام
# System logs
journalctl -u docker
```

---

**ملاحظة مهمة**: تأكد من تحديث عنوان الخادم في متغيرات البيئة قبل النشر.

**Important Note**: Make sure to update the server address in environment variables before deployment.

## 🔄 خطة الاستعادة السريعة / Quick Recovery Plan

إذا كانت المشكلة عاجلة، اتبع هذه الخطوات بالترتيب:

1. **تشخيص سريع**: `docker logs golden-horse-backend --tail=20`
2. **إنشاء مستخدم**: `docker exec -it golden-horse-backend node create-admin.js`
3. **اختبار فوري**: `curl -X POST https://your-domain.com/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`
4. **إذا فشل**: إعادة تشغيل الخدمات `docker-compose restart`
5. **الحل الأخير**: إعادة النشر الكامل `docker-compose down && docker-compose up -d --build`