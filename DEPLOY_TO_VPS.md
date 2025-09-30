# دليل النشر السريع على VPS

## الخطوات المطلوبة لحل مشكلة ERR_CONNECTION_REFUSED

### 1. رفع الملفات المحدثة إلى VPS

```bash
# نسخ الملفات المحدثة إلى VPS
scp docker-compose.prod.yml user@your-vps-ip:/path/to/project/
scp backend/.env user@your-vps-ip:/path/to/project/backend/
```

### 2. إيقاف الخدمات الحالية

```bash
# الاتصال بـ VPS
ssh user@your-vps-ip

# الانتقال إلى مجلد المشروع
cd /path/to/project

# إيقاف الحاويات الحالية
docker-compose -f docker-compose.prod.yml down
```

### 3. إعادة بناء ونشر التطبيق

```bash
# إعادة بناء الحاويات مع التحديثات الجديدة
docker-compose -f docker-compose.prod.yml build --no-cache

# تشغيل التطبيق
docker-compose -f docker-compose.prod.yml up -d
```

### 4. التحقق من حالة الخدمات

```bash
# فحص حالة الحاويات
docker-compose -f docker-compose.prod.yml ps

# فحص سجلات الأخطاء
docker-compose -f docker-compose.prod.yml logs

# فحص سجلات خدمة معينة
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs reverse-proxy
```

### 5. اختبار الاتصال

```bash
# اختبار الاتصال بالخادم الخلفي
curl http://localhost/api/health

# اختبار الواجهة الأمامية
curl http://localhost/
```

## التغييرات المهمة التي تم إجراؤها:

1. **تحديث docker-compose.prod.yml**: 
   - تغيير `NEXT_PUBLIC_API_URL` من `http://backend:3001/api` إلى `/api`

2. **تحديث backend/.env**:
   - تغيير `PORT` إلى `3001`
   - تغيير `NODE_ENV` إلى `production`
   - تحديث `CORS_ORIGIN` و `FRONTEND_URL`

## استكشاف الأخطاء:

### إذا استمرت المشكلة:

1. **فحص المنافذ**:
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :3001
```

2. **فحص جدار الحماية**:
```bash
sudo ufw status
sudo iptables -L
```

3. **فحص سجلات nginx**:
```bash
docker-compose -f docker-compose.prod.yml logs reverse-proxy
```

4. **اختبار الاتصال الداخلي**:
```bash
# دخول إلى حاوية frontend
docker-compose -f docker-compose.prod.yml exec frontend sh
# اختبار الاتصال بـ backend
curl http://backend:3001/api/health
```

## ملاحظات مهمة:

- تأكد من أن قاعدة البيانات متاحة ومتصلة
- تحقق من أن جميع المتغيرات في ملف `.env` صحيحة
- تأكد من أن المنفذ 80 متاح ولا يستخدمه تطبيق آخر
- في حالة استخدام HTTPS، تحتاج إلى إعداد شهادات SSL