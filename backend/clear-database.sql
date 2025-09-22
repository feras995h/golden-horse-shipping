-- سكريبت إفراغ قاعدة البيانات من المعلومات الوهمية
-- هذا السكريبت يحذف جميع البيانات من الجداول الرئيسية

-- حذف البيانات من جدول العملاء
DELETE FROM clients;

-- حذف البيانات من جدول الشحنات
DELETE FROM shipments;

-- حذف البيانات من جدول سجلات الدفع
DELETE FROM payment_records;

-- حذف البيانات من جدول المستخدمين
DELETE FROM users;

-- حذف البيانات من جدول الإعلانات
DELETE FROM ads;

-- حذف البيانات من جدول الإعدادات
DELETE FROM settings;

-- حذف البيانات من جدول حسابات العملاء (إذا كان موجود)
DELETE FROM customer_accounts;

-- حذف البيانات من جدول السفن (إذا كان موجود)
DELETE FROM vessels;

-- حذف البيانات من جدول أحداث التتبع (إذا كان موجود)
DELETE FROM tracking_events;

-- حذف البيانات من جدول الإشعارات (إذا كان موجود)
DELETE FROM notifications;

-- إعادة تعيين AUTO_INCREMENT
DELETE FROM sqlite_sequence WHERE name='clients';
DELETE FROM sqlite_sequence WHERE name='shipments';
DELETE FROM sqlite_sequence WHERE name='payment_records';
DELETE FROM sqlite_sequence WHERE name='users';
DELETE FROM sqlite_sequence WHERE name='ads';
DELETE FROM sqlite_sequence WHERE name='settings';
DELETE FROM sqlite_sequence WHERE name='customer_accounts';
DELETE FROM sqlite_sequence WHERE name='vessels';
DELETE FROM sqlite_sequence WHERE name='tracking_events';
DELETE FROM sqlite_sequence WHERE name='notifications';

-- عرض رسالة النجاح
SELECT 'تم إفراغ قاعدة البيانات بنجاح!' as message;

