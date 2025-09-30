# تعليمات إعداد متغيرات البيئة

## المشكلة الحالية
```
ERROR [ShipsGoTrackingService] ShipsGo API key not configured
ERROR [ShipsGoTrackingService] Failed to track BL MSKU4603728 from ShipsGo API
ERROR [ShipsGoTrackingService] ShipsGoAuthException: ShipsGo API authentication failed. Please check API key.
```

## الحل

### 1. إنشاء ملف .env
في مجلد `backend`، أنشئ ملف جديد باسم `.env` وأضف المحتوى التالي:

```env
# Database Configuration
DATABASE_URL=sqlite:./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# ShipsGo API Configuration
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_FALLBACK_TO_MOCK=true

# Rate Limiting
SHIPSGO_RATE_LIMIT=100

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 2. الحصول على ShipsGo API Key

#### الطريقة الأولى: استخدام Mock Data (للاختبار)
- اترك `SHIPSGO_FALLBACK_TO_MOCK=true`
- سيستخدم النظام بيانات وهمية للاختبار

#### الطريقة الثانية: الحصول على API Key حقيقي
1. **اذهب إلى**: https://shipsgo.com
2. **أنشئ حساب**: سجل حساب جديد
3. **اذهب إلى Dashboard**: بعد تسجيل الدخول
4. **ابحث عن API Keys**: في قسم الإعدادات
5. **أنشئ API Key جديد**: انسخ المفتاح
6. **استبدل في .env**: `SHIPSGO_API_KEY=your-actual-api-key`
7. **غيّر إلى**: `SHIPSGO_FALLBACK_TO_MOCK=false`

### 3. إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run start:dev
```

### 4. اختبار التكامل
```bash
# اختبار صحة التكامل
curl http://localhost:3001/api/shipsgo-tracking/health

# النتيجة المتوقعة:
# {"configured": true, "rateLimit": 100}
```

## حلول سريعة

### الحل السريع 1: استخدام Mock Data
```env
SHIPSGO_FALLBACK_TO_MOCK=true
SHIPSGO_API_KEY=dummy-key
```

### الحل السريع 2: تعطيل ShipsGo مؤقتاً
```env
SHIPSGO_FALLBACK_TO_MOCK=true
SHIPSGO_API_KEY=disabled
```

## التحقق من الإعداد

### 1. تحقق من ملف .env
```bash
# في مجلد backend
cat .env
```

### 2. اختبار API
```bash
curl http://localhost:3001/api/shipsgo-tracking/health
```

### 3. مراجعة Logs
```bash
# ابحث عن رسائل ShipsGo في logs
grep "ShipsGo" logs/application.log
```

## نصائح مهمة

1. **لا تشارك API Key**: احتفظ به سرياً
2. **استخدم Mock Data للاختبار**: أسرع وأسهل
3. **راجع Logs**: لمعرفة تفاصيل الأخطاء
4. **اختبر بانتظام**: للتأكد من عمل التكامل

## استكشاف الأخطاء

### خطأ "API key not configured"
- تأكد من وجود ملف .env
- تأكد من وجود `SHIPSGO_API_KEY` في الملف

### خطأ "authentication failed"
- تحقق من صحة API key
- تأكد من أن API key نشط

### خطأ "Rate limit exceeded"
- انتظر دقيقة واحدة
- أو قم بزيادة `SHIPSGO_RATE_LIMIT`





