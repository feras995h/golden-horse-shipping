# دليل تغيير الشعار - شركة الحصان الذهبي للشحن
# Logo Change Guide - Golden Horse Shipping

## تحليل المشكلة | Problem Analysis

تم تحليل نظام الشعار في التطبيق ووجدنا أن هناك عدة طرق لتغيير الشعار:

The logo system has been analyzed and there are several ways to change the logo:

## 🎯 الطرق المتاحة لتغيير الشعار | Available Methods

### 1. **الطريقة الأولى: من خلال لوحة التحكم (الأسهل)**
**Method 1: Through Admin Panel (Easiest)**

#### الخطوات | Steps:
1. **تسجيل الدخول للوحة التحكم**
   - اذهب إلى: `http://your-domain/admin/login`
   - استخدم بيانات المدير: `admin@goldenhorse-shipping.com` / `admin123`

2. **الانتقال لصفحة إدارة الشعار**
   - اذهب إلى: `http://your-domain/admin/logo`
   - أو من القائمة الجانبية: "إدارة الشعار"

3. **رفع الشعار الجديد**
   - اضغط على "اختيار ملف"
   - اختر ملف الشعار الجديد (SVG, PNG, JPG)
   - أدخل النص البديل للشعار
   - اضغط "رفع الشعار"

#### المتطلبات | Requirements:
- حجم الملف: أقل من 2MB
- الأنواع المدعومة: SVG, PNG, JPG, JPEG
- الأبعاد المفضلة: 300x300 بكسل أو أكبر

### 2. **الطريقة الثانية: من خلال صفحة الإعدادات**
**Method 2: Through Settings Page**

#### الخطوات | Steps:
1. اذهب إلى: `http://your-domain/admin/settings`
2. ابحث عن قسم "الشعار الحالي"
3. اضغط "اختيار ملف" لرفع شعار جديد
4. احفظ التغييرات

### 3. **الطريقة الثالثة: استبدال الملف مباشرة (للمطورين)**
**Method 3: Direct File Replacement (For Developers)**

#### الخطوات | Steps:
1. **استبدال الملف الافتراضي**:
   ```
   المسار: /frontend/public/images/logo.svg
   ```
   - احفظ نسخة احتياطية من الملف الحالي
   - استبدل `logo.svg` بالشعار الجديد
   - تأكد من أن اسم الملف يبقى `logo.svg`

2. **إعادة بناء التطبيق**:
   ```bash
   # في مجلد المشروع
   docker-compose down
   docker-compose up --build
   ```

## 🔧 المكونات التي تستخدم الشعار | Components Using Logo

### في الواجهة الأمامية | Frontend Components:
1. **Header.tsx** - الشعار في رأس الصفحة
2. **AdminLayout.tsx** - الشعار في لوحة التحكم
3. **Footer.tsx** - قد يحتوي على الشعار

### في الخلفية | Backend Components:
1. **settings.service.ts** - خدمة رفع الشعار
2. **settings.controller.ts** - تحكم في رفع الشعار

## 📁 مواقع ملفات الشعار | Logo File Locations

### الملف الافتراضي | Default File:
```
/frontend/public/images/logo.svg
```

### ملفات الشعار المرفوعة | Uploaded Logos:
```
/uploads/logo-[timestamp].[extension]
```

### قاعدة البيانات | Database:
```sql
-- في جدول settings
key: 'logoUrl'
value: '/uploads/logo-[timestamp].[extension]' أو '/images/logo.svg'
```

## 🎨 مواصفات الشعار الحالي | Current Logo Specifications

### التصميم | Design:
- **النوع**: SVG (Vector)
- **الأبعاد**: 300x300 بكسل
- **الألوان**: تدرج ذهبي (#fde047 إلى #ca8a04)
- **العناصر**: رأس حصان، دائرة حركة، خط زخرفي

### الاستخدام | Usage:
- يظهر في رأس الصفحة
- يظهر في لوحة التحكم
- يستخدم كأيقونة للموقع

## ⚠️ نصائح مهمة | Important Tips

### 1. **احتفظ بنسخة احتياطية**
Always keep a backup of the current logo before making changes.

### 2. **اختبر الشعار**
Test the new logo on different screen sizes and devices.

### 3. **تحسين الأداء**
- استخدم SVG للشعارات البسيطة (أفضل أداء)
- استخدم PNG للشعارات المعقدة
- ضغط الملفات لتحسين سرعة التحميل

### 4. **التوافق**
- تأكد من وضوح الشعار على الخلفيات المختلفة
- اختبر الشعار في الوضع الليلي والنهاري

## 🚨 حل المشاكل الشائعة | Troubleshooting

### المشكلة: الشعار لا يظهر
**Problem: Logo not showing**

#### الحلول | Solutions:
1. **تحقق من المسار**:
   ```javascript
   // في المتصفح، افتح Developer Tools واكتب:
   console.log(window.location.origin + '/images/logo.svg');
   ```

2. **تحقق من قاعدة البيانات**:
   ```sql
   SELECT * FROM settings WHERE key = 'logoUrl';
   ```

3. **تحقق من الملف**:
   - تأكد من وجود الملف في المسار الصحيح
   - تحقق من صلاحيات الملف

### المشكلة: الشعار مشوه أو بحجم خاطئ
**Problem: Logo distorted or wrong size**

#### الحلول | Solutions:
1. **تحقق من أبعاد الملف الأصلي**
2. **استخدم CSS لضبط الحجم**:
   ```css
   .logo {
     max-width: 100%;
     height: auto;
     object-fit: contain;
   }
   ```

### المشكلة: الشعار لا يتحديث بعد الرفع
**Problem: Logo doesn't update after upload**

#### الحلول | Solutions:
1. **امسح ذاكرة التخزين المؤقت**:
   ```bash
   # في المتصفح
   Ctrl + F5 (Windows) أو Cmd + Shift + R (Mac)
   ```

2. **أعد تشغيل الخادم**:
   ```bash
   docker-compose restart
   ```

## 📞 الدعم الفني | Technical Support

### للمساعدة السريعة | Quick Help:
1. **تحقق من سجلات الخادم**:
   ```bash
   docker logs golden-horse-shipping
   ```

2. **اختبار API الشعار**:
   ```bash
   curl http://localhost:3001/api/settings/public
   ```

3. **اختبار رفع الشعار**:
   - استخدم Postman أو أداة مشابهة
   - POST إلى `/api/settings/upload-logo`
   - أرفق ملف الشعار

## ✅ قائمة التحقق | Checklist

### قبل تغيير الشعار | Before Changing Logo:
- [ ] احتفظ بنسخة احتياطية من الشعار الحالي
- [ ] تأكد من جودة الشعار الجديد
- [ ] اختبر الشعار على خلفيات مختلفة
- [ ] تحقق من حجم الملف (أقل من 2MB)

### بعد تغيير الشعار | After Changing Logo:
- [ ] تحقق من ظهور الشعار في رأس الصفحة
- [ ] تحقق من ظهور الشعار في لوحة التحكم
- [ ] اختبر على أجهزة مختلفة
- [ ] امسح ذاكرة التخزين المؤقت
- [ ] تحقق من سرعة تحميل الصفحة

---

**ملاحظة**: هذا الدليل يغطي جميع الطرق المتاحة لتغيير الشعار. اختر الطريقة التي تناسب مستوى خبرتك التقنية.

**Note**: This guide covers all available methods for changing the logo. Choose the method that suits your technical expertise level.