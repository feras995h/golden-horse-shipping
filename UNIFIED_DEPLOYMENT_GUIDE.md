# دليل النشر الموحد - Golden Horse Shipping
# Unified Deployment Guide - Golden Horse Shipping

## نظرة عامة / Overview

تم توحيد آلية النشر لتطبيق Golden Horse Shipping لتبسيط عملية النشر وحل مشاكل الاتصال بين الواجهة والخادم نهائياً.

The deployment mechanism for Golden Horse Shipping has been unified to simplify deployment and permanently resolve frontend-backend connection issues.

## الملفات الجديدة / New Files

### 1. ملف Docker Compose الموحد / Unified Docker Compose
- **الملف**: `docker-compose.yml`
- **الوصف**: ملف واحد يدعم جميع بيئات النشر (تطوير، إنتاج، Coolify)
- **Description**: Single file supporting all deployment environments (development, production, Coolify)

### 2. ملف البيئة الرئيسي / Main Environment File
- **الملف**: `.env`
- **الوصف**: يحتوي على جميع متغيرات البيئة المطلوبة للنشر
- **Description**: Contains all required environment variables for deployment

### 3. ملف البيئة المثال / Example Environment File
- **الملف**: `.env.example`
- **الوصف**: قالب لإعداد متغيرات البيئة
- **Description**: Template for setting up environment variables

### 4. سكريبت النشر الموحد / Unified Deployment Scripts
- **Linux/Mac**: `deploy.sh`
- **Windows**: `deploy.bat`
- **الوصف**: سكريبت واحد للتعامل مع جميع سيناريوهات النشر
- **Description**: Single script handling all deployment scenarios

## طرق النشر المدعومة / Supported Deployment Methods

### 1. النشر الكامل للإنتاج / Full Production Deployment
```bash
# Linux/Mac
./deploy.sh production

# Windows
.\deploy.bat production
```

**الخدمات المشمولة / Services Included:**
- PostgreSQL Database
- Backend API
- Frontend Application
- Nginx Reverse Proxy

### 2. النشر المبسط / Single App Deployment
```bash
# Linux/Mac
./deploy.sh single-app

# Windows
.\deploy.bat single-app
```

**الخدمات المشمولة / Services Included:**
- Single Application (for Coolify/Railway)

### 3. نشر التطوير / Development Deployment
```bash
# Linux/Mac
./deploy.sh development

# Windows
.\deploy.bat development
```

**الخدمات المشمولة / Services Included:**
- All services with development configurations

## إعداد البيئة / Environment Setup

### 1. نسخ ملف البيئة / Copy Environment File
```bash
cp .env.example .env
```

### 2. تحديث المتغيرات / Update Variables
قم بتحديث المتغيرات التالية في ملف `.env`:
Update the following variables in `.env`:

```env
# VPS Configuration
NEXT_PUBLIC_VPS_URL=http://YOUR_VPS_IP
CORS_ORIGIN=http://YOUR_VPS_IP,https://YOUR_VPS_IP
FRONTEND_URL=http://YOUR_VPS_IP

# Database
DATABASE_URL=postgres://username:password@host:port/database
```

## حل مشكلة الاتصال / Connection Issue Resolution

### المشكلة السابقة / Previous Issue
- الواجهة كانت تحاول الاتصال بـ `localhost:3001`
- Frontend was trying to connect to `localhost:3001`
- خطأ: `net::ERR_CONNECTION_REFUSED`

### الحل المطبق / Applied Solution

#### 1. إعداد متغيرات البيئة الصحيحة / Correct Environment Variables
```env
# في ملف .env الرئيسي / In main .env file
NEXT_PUBLIC_API_URL=/api

# في ملف frontend/.env.production / In frontend/.env.production
NEXT_PUBLIC_API_URL=/api
```

#### 2. إعداد Nginx Proxy
```nginx
location /api {
    proxy_pass http://backend:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### 3. تحديث Docker Compose
- إضافة شبكة موحدة لجميع الخدمات
- Added unified network for all services
- إعداد health checks صحيحة
- Configured proper health checks

## خطوات النشر على الخادم / Server Deployment Steps

### 1. تحضير الخادم / Server Preparation
```bash
# تحديث النظام / Update system
sudo apt update && sudo apt upgrade -y

# تثبيت Docker / Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تثبيت Docker Compose / Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 2. رفع الملفات / Upload Files
```bash
# رفع المشروع إلى الخادم / Upload project to server
scp -r . user@your-vps-ip:/path/to/project
```

### 3. تشغيل النشر / Run Deployment
```bash
# الانتقال إلى مجلد المشروع / Navigate to project folder
cd /path/to/project

# تشغيل النشر / Run deployment
chmod +x deploy.sh
./deploy.sh production
```

## التحقق من النشر / Deployment Verification

### 1. فحص حالة الخدمات / Check Services Status
```bash
docker compose ps
```

### 2. فحص السجلات / Check Logs
```bash
# سجلات جميع الخدمات / All services logs
docker compose logs

# سجلات خدمة محددة / Specific service logs
docker compose logs frontend
docker compose logs backend
docker compose logs nginx
```

### 3. اختبار الاتصال / Test Connection
```bash
# اختبار الواجهة / Test frontend
curl http://your-vps-ip

# اختبار API / Test API
curl http://your-vps-ip/api/health
```

## استكشاف الأخطاء / Troubleshooting

### 1. خطأ في الاتصال بقاعدة البيانات / Database Connection Error
```bash
# فحص متغيرات البيئة / Check environment variables
docker compose config

# إعادة تشغيل قاعدة البيانات / Restart database
docker compose restart postgres
```

### 2. خطأ في بناء الصورة / Build Error
```bash
# بناء الصور من جديد / Rebuild images
docker compose build --no-cache

# حذف الصور القديمة / Remove old images
docker system prune -a
```

### 3. خطأ في Nginx / Nginx Error
```bash
# فحص إعدادات Nginx / Check Nginx configuration
docker compose exec nginx nginx -t

# إعادة تحميل Nginx / Reload Nginx
docker compose exec nginx nginx -s reload
```

## الأوامر المفيدة / Useful Commands

### إيقاف الخدمات / Stop Services
```bash
docker compose down
```

### إيقاف وحذف البيانات / Stop and Remove Data
```bash
docker compose down -v
```

### عرض استخدام الموارد / Show Resource Usage
```bash
docker stats
```

### تنظيف النظام / Clean System
```bash
docker system prune -a --volumes
```

## الأمان / Security

### 1. متغيرات البيئة الحساسة / Sensitive Environment Variables
- لا تشارك ملف `.env` في Git
- Don't commit `.env` file to Git
- استخدم كلمات مرور قوية
- Use strong passwords
- غير المفاتيح الافتراضية
- Change default keys

### 2. إعدادات الشبكة / Network Settings
- استخدم HTTPS في الإنتاج
- Use HTTPS in production
- قم بإعداد Firewall
- Configure Firewall
- حدد الوصول للمنافذ
- Restrict port access

## الدعم / Support

في حالة وجود مشاكل، يرجى التحقق من:
If you encounter issues, please check:

1. متغيرات البيئة صحيحة / Environment variables are correct
2. Docker و Docker Compose مثبتان / Docker and Docker Compose are installed
3. المنافذ غير مستخدمة / Ports are not in use
4. الذاكرة والمساحة كافية / Sufficient memory and disk space

---

**ملاحظة**: هذا الدليل يحل مشكلة الاتصال بين الواجهة والخادم نهائياً من خلال توحيد آلية النشر واستخدام إعدادات صحيحة.

**Note**: This guide permanently resolves the frontend-backend connection issue through unified deployment mechanism and correct configurations.