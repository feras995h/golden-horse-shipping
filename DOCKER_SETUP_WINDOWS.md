# دليل تثبيت Docker على Windows

## المشكلة الحالية
Docker غير مثبت على النظام المحلي. هذا ضروري لاختبار التكوين محلياً قبل النشر على VPS.

## خيارات التثبيت:

### الخيار 1: Docker Desktop (الأسهل)

1. **تحميل Docker Desktop**:
   - اذهب إلى: https://www.docker.com/products/docker-desktop/
   - حمل النسخة المناسبة لـ Windows

2. **التثبيت**:
   - شغل ملف التثبيت كمدير (Run as Administrator)
   - اتبع خطوات التثبيت
   - أعد تشغيل الكمبيوتر إذا طُلب منك

3. **التحقق من التثبيت**:
   ```powershell
   docker --version
   docker-compose --version
   ```

### الخيار 2: Docker CLI فقط

إذا كنت لا تريد Docker Desktop، يمكنك استخدام Docker CLI:

1. **تثبيت WSL2** (إذا لم يكن مثبتاً):
   ```powershell
   wsl --install
   ```

2. **تثبيت Docker في WSL2**:
   ```bash
   # في WSL2 terminal
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

## بدائل للاختبار بدون Docker محلياً:

### 1. اختبار التكوين يدوياً
يمكنك التحقق من صحة ملفات التكوين بدون تشغيل Docker:

```powershell
# التحقق من صحة YAML
Get-Content docker-compose.prod.yml
```

### 2. النشر المباشر على VPS
يمكنك نشر التغييرات مباشرة على VPS للاختبار:

```bash
# على VPS
docker-compose -f docker-compose.prod.yml config
docker-compose -f docker-compose.prod.yml up -d
```

## الخطوات التالية (بدون Docker محلياً):

1. **نسخ الملفات إلى VPS**:
   - `docker-compose.prod.yml` (محدث)
   - `backend/.env` (محدث)

2. **تشغيل الأوامر على VPS**:
   ```bash
   # إيقاف الخدمات الحالية
   docker-compose -f docker-compose.prod.yml down
   
   # إعادة البناء والتشغيل
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   
   # فحص الحالة
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs
   ```

3. **اختبار الاتصال**:
   ```bash
   # على VPS
   curl http://localhost/api/health
   curl http://localhost/
   ```

## ملاحظات مهمة:

- التغييرات التي أجريناها صحيحة نظرياً
- المشكلة الأصلية كانت في `NEXT_PUBLIC_API_URL` وتم إصلاحها
- ملف `.env` تم تحديثه للإنتاج
- الآن تحتاج فقط لنشر هذه التغييرات على VPS

## إذا كنت تريد تثبيت Docker:

أنصح بـ Docker Desktop لأنه الأسهل على Windows. بعد التثبيت ستتمكن من:
- اختبار التكوين محلياً
- تطوير التطبيق بسهولة
- استخدام نفس البيئة المستخدمة في الإنتاج