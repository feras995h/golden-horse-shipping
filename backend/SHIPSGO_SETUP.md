# إعداد ShipsGo API

## متغيرات البيئة المطلوبة

أضف هذه المتغيرات إلى ملف `.env` في مجلد `backend`:

```env
# ShipsGo API Configuration
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_FALLBACK_TO_MOCK=false

# Rate Limiting
SHIPSGO_RATE_LIMIT=100
```

## كيفية الحصول على API Key

1. **زيارة موقع ShipsGo**: https://shipsgo.com
2. **إنشاء حساب**: سجل حساب جديد
3. **الذهاب إلى Dashboard**: بعد تسجيل الدخول
4. **إنشاء API Key**: من قسم API Keys
5. **نسخ المفتاح**: وأضفه إلى ملف `.env`

## اختبار التكامل

### 1. تشغيل الخادم
```bash
cd backend
npm run start:dev
```

### 2. اختبار API
```bash
# اختبار صحة التكامل
curl http://localhost:3001/api/shipsgo-tracking/health

# اختبار تتبع حاوية (مثال)
curl "http://localhost:3001/api/shipsgo-tracking/track?container=ABCD1234567"
```

### 3. اختبار من الواجهة الأمامية
1. انتقل إلى صفحة التتبع
2. أدخل رقم حاوية صحيح
3. يجب أن تظهر بيانات ShipsGo الحقيقية

## استكشاف الأخطاء

### خطأ "API key not configured"
- تأكد من إضافة `SHIPSGO_API_KEY` إلى ملف `.env`
- أعد تشغيل الخادم بعد إضافة المفتاح

### خطأ "Failed to get tracking data"
- تحقق من صحة API key
- تأكد من أن رقم الحاوية صحيح
- راجع logs الخادم للأخطاء

### خطأ "Rate limit exceeded"
- انتظر دقيقة واحدة
- أو قم بزيادة `SHIPSGO_RATE_LIMIT`

## إعدادات إضافية

### تفعيل Mock Data (للاختبار)
```env
SHIPSGO_FALLBACK_TO_MOCK=true
```

### تغيير URL API
```env
SHIPSGO_API_URL=https://api-staging.shipsgo.com/v1
```

## مراقبة الأداء

### مراجعة Logs
```bash
# مراجعة logs التتبع
grep "ShipsGo" logs/application.log

# مراجعة أخطاء API
grep "API" logs/application.log
```

### إحصائيات الاستخدام
- انتقل إلى `/api/shipsgo-tracking/health`
- راجع عدد الطلبات المتبقية

