# دليل تثبيت Docker على Windows
# Docker Installation Guide for Windows

## نظرة عامة / Overview

هذا الدليل يوضح كيفية تثبيت Docker على نظام Windows لتشغيل تطبيق Golden Horse Shipping.

This guide explains how to install Docker on Windows to run the Golden Horse Shipping application.

## متطلبات النظام / System Requirements

### الحد الأدنى / Minimum Requirements
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 16299 or later)
- Windows 11 64-bit: Home or Pro version 21H2 or higher
- WSL 2 feature enabled
- BIOS-level hardware virtualization support
- At least 4GB RAM

### المتطلبات الموصى بها / Recommended Requirements
- 8GB RAM or more
- SSD storage
- Stable internet connection

## طرق التثبيت / Installation Methods

### الطريقة الأولى: Docker Desktop (موصى بها / Recommended)

#### 1. تحميل Docker Desktop
- اذهب إلى: https://www.docker.com/products/docker-desktop/
- Go to: https://www.docker.com/products/docker-desktop/
- انقر على "Download for Windows"
- Click "Download for Windows"

#### 2. تشغيل المثبت / Run Installer
```powershell
# تشغيل الملف المحمل / Run downloaded file
.\Docker Desktop Installer.exe
```

#### 3. اتباع خطوات التثبيت / Follow Installation Steps
1. قبول شروط الاستخدام / Accept license terms
2. اختيار "Use WSL 2 instead of Hyper-V" (موصى به / Recommended)
3. انتظار اكتمال التثبيت / Wait for installation completion
4. إعادة تشغيل الكمبيوتر / Restart computer

#### 4. التحقق من التثبيت / Verify Installation
```powershell
# فحص إصدار Docker / Check Docker version
docker --version

# فحص إصدار Docker Compose / Check Docker Compose version
docker compose version

# تشغيل اختبار / Run test
docker run hello-world
```

### الطريقة الثانية: تثبيت WSL 2 أولاً / Method 2: Install WSL 2 First

#### 1. تفعيل WSL / Enable WSL
```powershell
# تشغيل PowerShell كمدير / Run PowerShell as Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# تفعيل Virtual Machine Platform / Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

#### 2. إعادة التشغيل / Restart
```powershell
# إعادة تشغيل النظام / Restart system
Restart-Computer
```

#### 3. تحديث WSL إلى الإصدار 2 / Update WSL to Version 2
```powershell
# تحميل وتثبيت WSL2 Linux kernel update package
# Download and install WSL2 Linux kernel update package
# من: https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

# تعيين WSL 2 كإصدار افتراضي / Set WSL 2 as default version
wsl --set-default-version 2
```

#### 4. تثبيت توزيعة Linux / Install Linux Distribution
```powershell
# تثبيت Ubuntu (موصى به / Recommended)
wsl --install -d Ubuntu
```

#### 5. تثبيت Docker Desktop
- اتبع الخطوات من الطريقة الأولى
- Follow steps from Method 1

## إعداد Docker بعد التثبيت / Docker Configuration After Installation

### 1. إعدادات الذاكرة / Memory Settings
```json
// في ملف ~/.docker/daemon.json / In ~/.docker/daemon.json file
{
  "memory": "4g",
  "cpus": 2
}
```

### 2. إعدادات WSL 2 / WSL 2 Settings
```ini
# في ملف ~/.wslconfig / In ~/.wslconfig file
[wsl2]
memory=4GB
processors=2
swap=2GB
```

### 3. إعادة تشغيل Docker / Restart Docker
```powershell
# إعادة تشغيل Docker Desktop / Restart Docker Desktop
# أو من خلال واجهة Docker Desktop / Or through Docker Desktop interface
```

## اختبار التثبيت / Testing Installation

### 1. اختبار أساسي / Basic Test
```powershell
# فحص حالة Docker / Check Docker status
docker info

# تشغيل حاوية اختبار / Run test container
docker run --rm hello-world
```

### 2. اختبار Docker Compose
```powershell
# إنشاء ملف اختبار / Create test file
echo "version: '3.8'
services:
  test:
    image: nginx:alpine
    ports:
      - '8080:80'" > docker-compose.test.yml

# تشغيل الاختبار / Run test
docker compose -f docker-compose.test.yml up -d

# فحص الحالة / Check status
docker compose -f docker-compose.test.yml ps

# إيقاف الاختبار / Stop test
docker compose -f docker-compose.test.yml down

# حذف ملف الاختبار / Remove test file
del docker-compose.test.yml
```

### 3. اختبار تطبيق Golden Horse / Test Golden Horse Application
```powershell
# الانتقال إلى مجلد المشروع / Navigate to project folder
cd "C:\Users\dell\Desktop\موقع وائل 2"

# تشغيل النشر / Run deployment
.\deploy.bat production
```

## حل المشاكل الشائعة / Common Issues Troubleshooting

### 1. خطأ "Docker is not running"
```powershell
# تشغيل Docker Desktop يدوياً / Start Docker Desktop manually
# أو إعادة تشغيل خدمة Docker / Or restart Docker service
Restart-Service docker
```

### 2. خطأ WSL 2
```powershell
# تحديث WSL / Update WSL
wsl --update

# إعادة تشغيل WSL / Restart WSL
wsl --shutdown
```

### 3. مشاكل الذاكرة / Memory Issues
```powershell
# تنظيف Docker / Clean Docker
docker system prune -a --volumes

# إعادة تشغيل Docker / Restart Docker
# من خلال Docker Desktop / Through Docker Desktop
```

### 4. مشاكل الشبكة / Network Issues
```powershell
# إعادة تعيين شبكة Docker / Reset Docker network
docker network prune

# إعادة إنشاء الشبكات / Recreate networks
docker compose down
docker compose up -d
```

## أوامر مفيدة / Useful Commands

### إدارة Docker / Docker Management
```powershell
# عرض الحاويات النشطة / Show running containers
docker ps

# عرض جميع الحاويات / Show all containers
docker ps -a

# عرض الصور / Show images
docker images

# تنظيف النظام / Clean system
docker system prune -a
```

### إدارة Docker Compose / Docker Compose Management
```powershell
# تشغيل الخدمات / Start services
docker compose up -d

# إيقاف الخدمات / Stop services
docker compose down

# عرض السجلات / Show logs
docker compose logs

# إعادة بناء الصور / Rebuild images
docker compose build --no-cache
```

## نصائح للأداء / Performance Tips

### 1. تحسين الذاكرة / Memory Optimization
- خصص ذاكرة كافية لـ Docker (4GB على الأقل)
- Allocate sufficient memory to Docker (at least 4GB)
- أغلق التطبيقات غير الضرورية
- Close unnecessary applications

### 2. تحسين التخزين / Storage Optimization
- استخدم SSD إذا كان متاحاً
- Use SSD if available
- نظف الصور والحاويات القديمة بانتظام
- Clean old images and containers regularly

### 3. تحسين الشبكة / Network Optimization
- استخدم اتصال إنترنت مستقر
- Use stable internet connection
- تجنب استخدام VPN أثناء التطوير
- Avoid using VPN during development

## الخطوات التالية / Next Steps

بعد تثبيت Docker بنجاح:
After successful Docker installation:

1. ارجع إلى دليل النشر الموحد / Return to Unified Deployment Guide
2. اتبع خطوات إعداد البيئة / Follow environment setup steps
3. شغل تطبيق Golden Horse / Run Golden Horse application

```powershell
# تشغيل التطبيق / Run application
.\deploy.bat production
```

---

**ملاحظة**: تأكد من إعادة تشغيل الكمبيوتر بعد تثبيت Docker لضمان عمل جميع المكونات بشكل صحيح.

**Note**: Make sure to restart your computer after installing Docker to ensure all components work correctly.