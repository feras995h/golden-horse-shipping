# دليل النشر الآمن للخادم المشترك
## Safe Deployment Guide for Shared Server

### 🚨 تحذير مهم / Important Warning

إذا كان هناك موقع آخر يعمل على نفس الخادم، فقد يتأثر النشر. هذا الدليل يوضح كيفية النشر بأمان.

If there's another website running on the same server, the deployment might affect it. This guide shows how to deploy safely.

---

## 📋 فحص الخادم قبل النشر / Pre-deployment Server Check

### الخطوة 1: فحص الموارد / Step 1: Resource Check

```bash
# تشغيل سكريبت فحص الموارد
# Run resource check script
chmod +x check-server-resources.sh
./check-server-resources.sh
```

### الخطوة 2: فحص المواقع الموجودة / Step 2: Check Existing Sites

```bash
# فحص المواقع التي تعمل على المنافذ المختلفة
# Check sites running on different ports
netstat -tlnp | grep -E ':(80|443|8080|3000|3001)'

# فحص خدمات الويب
# Check web services
systemctl status nginx apache2 httpd 2>/dev/null || true
```

---

## ⚠️ المخاطر المحتملة / Potential Risks

### 1. تضارب المنافذ / Port Conflicts
- **المنفذ 80**: قد يكون مستخدماً من موقع آخر
- **المنفذ 443**: للمواقع المشفرة (HTTPS)
- **المنافذ 3000/3001**: للتطبيقات الأخرى

### 2. استهلاك الموارد / Resource Usage
- **الذاكرة**: قد تنفد إذا كان هناك تطبيقات أخرى
- **المعالج**: قد يبطئ الخادم
- **التخزين**: قد يمتلئ القرص الصلب

### 3. تضارب قواعد البيانات / Database Conflicts
- **PostgreSQL**: قد يكون مستخدماً من تطبيق آخر
- **MySQL**: قد يتضارب مع قواعد البيانات الموجودة

---

## 🛡️ استراتيجية النشر الآمن / Safe Deployment Strategy

### الخيار 1: النشر مع منافذ مخصصة / Option 1: Deploy with Custom Ports

```bash
# تعديل docker-compose.prod.yml لاستخدام منافذ مختلفة
# Modify docker-compose.prod.yml to use different ports

# بدلاً من المنفذ 80، استخدم 8080
# Instead of port 80, use 8080
nginx:
  ports:
    - "8080:80"

# بدلاً من 3000، استخدم 3002
# Instead of 3000, use 3002
frontend:
  ports:
    - "3002:3000"

# بدلاً من 3001، استخدم 3003
# Instead of 3001, use 3003
backend:
  ports:
    - "3003:3001"
```

### الخيار 2: استخدام Nginx Reverse Proxy / Option 2: Use Nginx Reverse Proxy

```nginx
# إضافة إعدادات للموقع الجديد في /etc/nginx/sites-available/
# Add settings for new site in /etc/nginx/sites-available/

server {
    listen 80;
    server_name golden-horse.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### الخيار 3: استخدام Docker Networks المنفصلة / Option 3: Use Separate Docker Networks

```yaml
# إنشاء شبكة منفصلة للتطبيق
# Create separate network for the application
networks:
  golden-horse-isolated:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 🔧 خطوات النشر الآمن / Safe Deployment Steps

### 1. النسخ الاحتياطي / Backup

```bash
# نسخ احتياطي من الإعدادات الحالية
# Backup current configurations
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
docker ps > running_containers_backup.txt
```

### 2. فحص الموارد / Resource Check

```bash
# فحص استخدام الذاكرة والمعالج
# Check memory and CPU usage
free -h
top -bn1 | head -20
df -h
```

### 3. النشر التدريجي / Gradual Deployment

```bash
# تشغيل قاعدة البيانات أولاً
# Start database first
docker-compose -f docker-compose.prod.yml up -d postgres

# انتظار حتى تصبح جاهزة
# Wait until ready
sleep 30

# تشغيل الخادم الخلفي
# Start backend
docker-compose -f docker-compose.prod.yml up -d backend

# انتظار وفحص
# Wait and check
sleep 30
curl http://localhost:3001/api/health

# تشغيل الواجهة الأمامية
# Start frontend
docker-compose -f docker-compose.prod.yml up -d frontend

# أخيراً تشغيل Nginx
# Finally start Nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

---

## 📊 مراقبة الأداء / Performance Monitoring

### أوامر المراقبة / Monitoring Commands

```bash
# مراقبة استخدام الموارد
# Monitor resource usage
watch -n 5 'free -h && echo "---" && df -h && echo "---" && docker stats --no-stream'

# مراقبة السجلات
# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f

# فحص حالة الخدمات
# Check service status
docker-compose -f docker-compose.prod.yml ps
```

---

## 🚨 خطة الطوارئ / Emergency Plan

### إذا تعطل الموقع الآخر / If Other Site Breaks

```bash
# إيقاف تطبيق Golden Horse فوراً
# Stop Golden Horse immediately
docker-compose -f docker-compose.prod.yml down

# استعادة إعدادات Nginx
# Restore Nginx settings
cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
systemctl restart nginx

# إعادة تشغيل الخدمات الأصلية
# Restart original services
systemctl start apache2  # أو nginx حسب النظام
```

### إذا نفدت الموارد / If Resources Run Out

```bash
# تقليل استهلاك الذاكرة
# Reduce memory usage
docker-compose -f docker-compose.prod.yml down frontend
# تشغيل الواجهة الأمامية على خادم منفصل

# تحسين إعدادات قاعدة البيانات
# Optimize database settings
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
ALTER SYSTEM SET shared_buffers = '128MB';
ALTER SYSTEM SET effective_cache_size = '256MB';
SELECT pg_reload_conf();
"
```

---

## ✅ قائمة التحقق / Checklist

### قبل النشر / Before Deployment
- [ ] فحص استخدام الذاكرة (< 70%)
- [ ] فحص مساحة القرص الصلب (< 80%)
- [ ] فحص المنافذ المستخدمة
- [ ] نسخ احتياطي من الإعدادات
- [ ] إعلام مستخدمي المواقع الأخرى

### أثناء النشر / During Deployment
- [ ] مراقبة استخدام الموارد
- [ ] فحص سجلات الأخطاء
- [ ] اختبار الوصول للمواقع الأخرى
- [ ] اختبار تطبيق Golden Horse

### بعد النشر / After Deployment
- [ ] فحص جميع المواقع تعمل بشكل صحيح
- [ ] مراقبة الأداء لمدة ساعة
- [ ] إعداد مراقبة تلقائية
- [ ] توثيق التغييرات المطبقة

---

## 📞 جهات الاتصال للطوارئ / Emergency Contacts

- **مدير الخادم**: [رقم الهاتف]
- **مطور التطبيق**: [رقم الهاتف]
- **دعم الاستضافة**: [رقم الهاتف]

---

## 🔗 روابط مفيدة / Useful Links

- [دليل Docker](https://docs.docker.com/)
- [دليل Nginx](https://nginx.org/en/docs/)
- [مراقبة الخادم](https://www.digitalocean.com/community/tutorials/how-to-monitor-server-health-with-checkmk-on-ubuntu-18-04)