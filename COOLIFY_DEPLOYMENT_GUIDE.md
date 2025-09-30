# دليل النشر عبر Coolify | Coolify Deployment Guide

## نظرة عامة | Overview

هذا الدليل يوضح كيفية إعادة نشر تطبيق Golden Horse Logistics بشكل هادئ وآمن عبر منصة Coolify.

This guide explains how to quietly and safely redeploy the Golden Horse Logistics application via the Coolify platform.

---

## الإعدادات الحالية | Current Configuration

### ملف Coolify (.coolify.yml)
```yaml
build:
  dockerfile: Dockerfile
  context: .
deploy:
  startCommand: "cd backend && node dist/main.js"
  healthcheckPath: "/api/health"
environment:
  NODE_ENV: "production"
  JWT_SECRET: "cc551c5e5110b8aee35898a7fa3ec0269d38e01849d711a9798ec61b154009a7dddcc71709725ee258c43f2e1678c3638534137a96211900425348409bfb1789"
  JWT_EXPIRES_IN: "7d"
  DATABASE_URL: "postgresql://postgres:Feras123@ep-weathered-darkness-a5ixqhzr.us-east-2.aws.neon.tech:5433/neondb?sslmode=require"
```

### Docker Compose للـ Coolify
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## خطوات إعادة النشر الهادئ | Quiet Redeployment Steps

### 1. التحضير المسبق | Pre-deployment Preparation

#### أ) التأكد من GitHub
- ✅ تأكد من رفع جميع التغييرات إلى GitHub
- ✅ تحقق من أن الفرع الرئيسي (main/master) محدث
- ✅ راجع آخر commit للتأكد من صحة التغييرات

#### b) GitHub Verification
- ✅ Ensure all changes are pushed to GitHub
- ✅ Verify main/master branch is up to date
- ✅ Review latest commit for accuracy

### 2. الوصول إلى Coolify | Accessing Coolify

#### أ) تسجيل الدخول
1. افتح متصفح الويب
2. اذهب إلى لوحة تحكم Coolify الخاصة بك
3. سجل دخولك باستخدام بياناتك

#### b) Login Process
1. Open web browser
2. Navigate to your Coolify dashboard
3. Login with your credentials

### 3. العثور على المشروع | Finding Your Project

#### أ) البحث عن التطبيق
- ابحث عن "Golden Horse Logistics" أو اسم مشروعك
- تأكد من أنك في المشروع الصحيح
- تحقق من حالة التطبيق الحالية

#### b) Locating Application
- Search for "Golden Horse Logistics" or your project name
- Ensure you're in the correct project
- Check current application status

### 4. تنفيذ إعادة النشر | Executing Redeployment

#### أ) بدء عملية النشر
1. اضغط على زر "Deploy" أو "Redeploy"
2. اختر الفرع المناسب (عادة main)
3. تأكد من الإعدادات قبل التأكيد
4. اضغط "Confirm" أو "Start Deployment"

#### b) Starting Deployment
1. Click "Deploy" or "Redeploy" button
2. Select appropriate branch (usually main)
3. Verify settings before confirming
4. Click "Confirm" or "Start Deployment"

### 5. مراقبة عملية النشر | Monitoring Deployment

#### أ) مراقبة السجلات
- راقب سجلات البناء (Build Logs)
- تابع سجلات النشر (Deployment Logs)
- انتظر رسالة النجاح

#### b) Log Monitoring
- Monitor Build Logs
- Follow Deployment Logs
- Wait for success message

---

## التحقق من نجاح النشر | Deployment Verification

### 1. فحص الحالة الصحية | Health Check

```bash
# فحص صحة التطبيق
curl -f https://[your-domain]/api/health

# النتيجة المتوقعة
{
  "status": "ok",
  "timestamp": "2024-01-XX",
  "database": "connected"
}
```

### 2. اختبار تسجيل الدخول | Login Testing

#### بيانات الدخول الافتراضية | Default Credentials
- **البريد الإلكتروني | Email:** admin@goldenhorse.com
- **كلمة المرور | Password:** admin123

### 3. فحص الوظائف الأساسية | Basic Functionality Check

- ✅ تسجيل الدخول
- ✅ عرض لوحة التحكم
- ✅ إنشاء شحنة جديدة
- ✅ تتبع الشحنات
- ✅ إدارة العملاء

---

## استكشاف الأخطاء | Troubleshooting

### مشاكل شائعة | Common Issues

#### 1. فشل البناء | Build Failure
```bash
# الأسباب المحتملة:
- خطأ في Dockerfile
- مشاكل في dependencies
- نقص في الذاكرة

# الحلول:
- راجع Dockerfile
- تحقق من package.json
- زيد موارد الخادم
```

#### 2. فشل قاعدة البيانات | Database Connection Failure
```bash
# التحقق من الاتصال:
- راجع DATABASE_URL
- تأكد من صحة بيانات الاعتماد
- فحص حالة قاعدة البيانات

# الحل:
- تحديث متغيرات البيئة
- إعادة تشغيل قاعدة البيانات
```

#### 3. مشاكل الشبكة | Network Issues
```bash
# الفحص:
- تحقق من إعدادات المنافذ
- راجع إعدادات الشبكة
- فحص جدار الحماية

# الحل:
- تحديث إعدادات المنافذ
- إعادة تكوين الشبكة
```

---

## الأوامر المفيدة | Useful Commands

### في لوحة تحكم Coolify | In Coolify Dashboard

#### 1. عرض السجلات | View Logs
- **Build Logs:** سجلات البناء
- **Runtime Logs:** سجلات التشغيل
- **Error Logs:** سجلات الأخطاء

#### 2. إدارة التطبيق | Application Management
- **Restart:** إعادة تشغيل
- **Stop:** إيقاف
- **Scale:** توسيع النطاق
- **Environment:** متغيرات البيئة

#### 3. المراقبة | Monitoring
- **Resource Usage:** استخدام الموارد
- **Performance Metrics:** مقاييس الأداء
- **Health Status:** حالة الصحة

---

## خطة الطوارئ | Emergency Plan

### في حالة فشل النشر | If Deployment Fails

#### 1. الإجراءات الفورية | Immediate Actions
```bash
# 1. إيقاف النشر الحالي
- اضغط "Stop Deployment" في Coolify

# 2. العودة للإصدار السابق
- اختر "Rollback to Previous Version"

# 3. فحص السجلات
- راجع Error Logs لتحديد المشكلة
```

#### 2. التشخيص | Diagnosis
```bash
# فحص الأخطاء الشائعة:
- خطأ في البناء
- مشاكل قاعدة البيانات
- نقص الموارد
- خطأ في الكود
```

#### 3. الإصلاح | Fix and Retry
```bash
# خطوات الإصلاح:
1. إصلاح المشكلة في الكود
2. رفع التغييرات إلى GitHub
3. إعادة محاولة النشر
4. مراقبة العملية
```

---

## نصائح للأداء الأمثل | Performance Optimization Tips

### 1. تحسين البناء | Build Optimization
```dockerfile
# استخدام multi-stage builds
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production
# ... production setup
```

### 2. تحسين قاعدة البيانات | Database Optimization
```bash
# فهرسة الجداول
- إنشاء فهارس للاستعلامات الشائعة
- تحسين استعلامات SQL
- استخدام connection pooling
```

### 3. مراقبة الموارد | Resource Monitoring
```bash
# مراقبة منتظمة:
- استخدام الذاكرة
- استخدام المعالج
- مساحة القرص
- اتصالات الشبكة
```

---

## الدعم والمساعدة | Support and Help

### 1. الوثائق الرسمية | Official Documentation
- [Coolify Documentation](https://coolify.io/docs)
- [Docker Documentation](https://docs.docker.com)
- [Node.js Best Practices](https://nodejs.org/en/docs)

### 2. المجتمع | Community
- Coolify Discord Server
- GitHub Issues
- Stack Overflow

### 3. الدعم الفني | Technical Support
- راجع سجلات الأخطاء أولاً
- اجمع معلومات النظام
- وصف المشكلة بالتفصيل

---

## الخلاصة | Summary

إعادة النشر عبر Coolify عملية بسيطة وآمنة عند اتباع الخطوات الصحيحة:

1. ✅ تحضير الكود في GitHub
2. ✅ الوصول إلى Coolify
3. ✅ تنفيذ النشر
4. ✅ مراقبة العملية
5. ✅ التحقق من النجاح

Redeployment via Coolify is simple and safe when following proper steps:

1. ✅ Prepare code in GitHub
2. ✅ Access Coolify
3. ✅ Execute deployment
4. ✅ Monitor process
5. ✅ Verify success

---

**تاريخ آخر تحديث | Last Updated:** $(date)
**الإصدار | Version:** 1.0
**المؤلف | Author:** Golden Horse Logistics Team