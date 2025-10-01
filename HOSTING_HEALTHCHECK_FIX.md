# إصلاح مشكلة Healthcheck في الاستضافة / Hosting Healthcheck Fix

## تشخيص المشكلة / Problem Diagnosis

### المشكلة الحالية / Current Issue
```
Healthcheck status: "unhealthy"
Healthcheck logs: wget: can't connect to remote host: Connection refused
Return code: 1
```

### السبب / Root Cause
1. **خطأ في تكوين Healthcheck**: الـ Docker healthcheck كان يستخدم `wget` بدلاً من `curl`
2. **مهلة زمنية قصيرة**: الـ start-period كان قصيراً جداً (5 ثوانٍ)
3. **عدد محاولات قليل**: فقط 3 محاولات قبل اعتبار الخدمة غير صحية

## الحل المطبق / Applied Solution

### 1. تحديث Dockerfile
تم تحديث الـ healthcheck في الـ Dockerfile:

```dockerfile
# Health check - using curl which is already installed in the alpine image
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:${BACKEND_PORT:-3001}/api/health || exit 1
```

### التحسينات / Improvements:
- **استخدام curl**: بدلاً من wget (curl متوفر في alpine image)
- **زيادة start-period**: من 5 ثوانٍ إلى 60 ثانية لإعطاء وقت كافي للتطبيق للبدء
- **زيادة timeout**: من 10 ثوانٍ إلى 15 ثانية
- **زيادة retries**: من 3 إلى 5 محاولات

### 2. نقطة Health Endpoint
التطبيق يحتوي على نقطة صحية في:
- **المسار**: `/api/health`
- **المنفذ**: 3001 (BACKEND_PORT)
- **الاستجابة**: JSON مع معلومات الحالة

## خطوات إعادة النشر / Redeployment Steps

### للـ Coolify:
1. **Commit التغييرات**:
```bash
git add Dockerfile
git commit -m "Fix Docker healthcheck configuration"
git push origin main
```

2. **إعادة النشر في Coolify**:
   - اذهب إلى لوحة تحكم Coolify
   - اختر المشروع
   - اضغط على "Deploy"
   - انتظر حتى اكتمال النشر

### للـ VPS مع Docker:
```bash
# إيقاف الحاوية الحالية
docker stop golden-horse-app

# حذف الحاوية القديمة
docker rm golden-horse-app

# بناء صورة جديدة
docker build -t golden-horse-shipping .

# تشغيل الحاوية الجديدة
docker run -d \
  --name golden-horse-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your_database_url" \
  golden-horse-shipping
```

## التحقق من الإصلاح / Verification

### 1. فحص حالة الحاوية:
```bash
docker ps
docker inspect golden-horse-app | grep Health
```

### 2. فحص logs الـ healthcheck:
```bash
docker logs golden-horse-app
```

### 3. اختبار نقطة الصحة يدوياً:
```bash
curl http://localhost:3001/api/health
```

**الاستجابة المتوقعة**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "Golden Horse Shipping API",
  "version": "1.0.0"
}
```

## استكشاف الأخطاء / Troubleshooting

### إذا استمرت المشكلة:

1. **تحقق من المنافذ**:
```bash
netstat -tlnp | grep :3001
```

2. **تحقق من متغيرات البيئة**:
```bash
docker exec golden-horse-app env | grep PORT
```

3. **تحقق من logs التطبيق**:
```bash
docker logs -f golden-horse-app
```

### مشاكل شائعة:

1. **Database Connection**: تأكد من صحة DATABASE_URL
2. **Port Binding**: تأكد من أن المنفذ 3001 غير مستخدم
3. **Memory Issues**: تأكد من توفر ذاكرة كافية

## الدعم السريع / Quick Support

### أوامر التشخيص السريع:
```bash
# فحص حالة الحاوية
docker ps -a

# فحص healthcheck
docker inspect --format='{{.State.Health.Status}}' golden-horse-app

# فحص logs
docker logs --tail=50 golden-horse-app

# اختبار API
curl -v http://localhost:3001/api/health
```

### معلومات الاتصال للدعم:
- **البريد الإلكتروني**: support@goldenhorse-shipping.com
- **الهاتف**: +971-XX-XXX-XXXX

---

## ملاحظات مهمة / Important Notes

1. **النسخ الاحتياطي**: تأكد من عمل نسخة احتياطية قبل إعادة النشر
2. **وقت التوقف**: قد يحدث توقف مؤقت أثناء إعادة النشر
3. **المراقبة**: راقب الخدمة لمدة 10-15 دقيقة بعد النشر

**تاريخ الإنشاء**: $(date)
**الإصدار**: 1.0.0