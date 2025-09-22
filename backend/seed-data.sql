-- إضافة بيانات تجريبية لقاعدة البيانات

-- إضافة عملاء تجريبيين
INSERT INTO clients (id, full_name, email, phone, company, address_line_1, city, country, client_id, notes, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'أحمد محمد الليبي', 'ahmed.libya@example.com', '+218911234567', 'شركة الليبي للتجارة', 'شارع الجمهورية', 'طرابلس', 'ليبيا', 'CLI-001', 'عميل مهم - شحنات منتظمة', true, datetime('now'), datetime('now')),
('550e8400-e29b-41d4-a716-446655440002', 'فاطمة علي السوداني', 'fatima.sudan@example.com', '+249911234567', 'مؤسسة النيل', 'شارع النيل', 'الخرطوم', 'السودان', 'CLI-002', 'عميل جديد - أول شحنة', true, datetime('now'), datetime('now')),
('550e8400-e29b-41d4-a716-446655440003', 'محمد عبدالله المصري', 'mohamed.egypt@example.com', '+201012345678', 'شركة الأهرام للاستيراد', 'شارع التحرير', 'القاهرة', 'مصر', 'CLI-003', 'عميل VIP - شحنات كبيرة', true, datetime('now'), datetime('now')),
('550e8400-e29b-41d4-a716-446655440004', 'سارة أحمد التونسي', 'sara.tunisia@example.com', '+21612345678', 'مؤسسة قرطاج الطبية', 'شارع الحبيب بورقيبة', 'تونس', 'تونس', 'CLI-004', 'عميل منتظم - معدات طبية', true, datetime('now'), datetime('now')),
('550e8400-e29b-41d4-a716-446655440005', 'خالد محمود الأردني', 'khaled.jordan@example.com', '+962791234567', 'شركة البتراء للقطع', 'شارع الملك حسين', 'عمان', 'الأردن', 'CLI-005', 'عميل تجاري - قطع غيار', true, datetime('now'), datetime('now'));

-- إضافة شحنات تجريبية
INSERT INTO shipments (id, tracking_number, tracking_token, client_id, description, type, origin_port, destination_port, weight, dimensions, declared_value, shipping_cost, insurance_cost, total_cost, status, payment_status, estimated_delivery, actual_delivery, notes, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'GH-2024-001', 'token001', '550e8400-e29b-41d4-a716-446655440001', 'معدات صناعية - آلات تصنيع', 'sea', 'شنغهاي، الصين', 'طرابلس، ليبيا', 2500.00, '200x150x100 cm', 15000.00, 2800.00, 750.00, 3550.00, 'in_transit', 'paid', datetime('now', '+15 days'), NULL, 'شحنة عاجلة - أولوية عالية', datetime('now', '-10 days'), datetime('now', '-10 days')),
('660e8400-e29b-41d4-a716-446655440002', 'GH-2024-002', 'token002', '550e8400-e29b-41d4-a716-446655440002', 'أجهزة إلكترونية - هواتف ذكية', 'air', 'شنتشن، الصين', 'الخرطوم، السودان', 150.00, '80x60x40 cm', 8000.00, 1200.00, 400.00, 1600.00, 'shipped', 'paid', datetime('now', '+12 days'), NULL, 'تأمين إضافي مطلوب', datetime('now', '-7 days'), datetime('now', '-7 days')),
('660e8400-e29b-41d4-a716-446655440003', 'GH-2024-003', 'token003', '550e8400-e29b-41d4-a716-446655440003', 'مواد بناء - أدوات كهربائية', 'sea', 'قوانغتشو، الصين', 'القاهرة، مصر', 800.00, '120x80x60 cm', 5000.00, 1800.00, 250.00, 2050.00, 'at_port', 'partial', datetime('now', '+8 days'), NULL, 'في انتظار التخليص الجمركي', datetime('now', '-5 days'), datetime('now', '-5 days')),
('660e8400-e29b-41d4-a716-446655440004', 'GH-2024-004', 'token004', '550e8400-e29b-41d4-a716-446655440004', 'معدات طبية - أجهزة تشخيص', 'air', 'بكين، الصين', 'تونس، تونس', 300.00, '100x70x50 cm', 12000.00, 2200.00, 600.00, 2800.00, 'customs_clearance', 'paid', datetime('now', '+10 days'), NULL, 'يتطلب تصاريح خاصة', datetime('now', '-3 days'), datetime('now', '-3 days')),
('660e8400-e29b-41d4-a716-446655440005', 'GH-2024-005', 'token005', '550e8400-e29b-41d4-a716-446655440005', 'قطع غيار سيارات - فلاتر ومحركات', 'land', 'تيانجين، الصين', 'عمان، الأردن', 1200.00, '150x100x80 cm', 7500.00, 2000.00, 375.00, 2375.00, 'processing', 'unpaid', datetime('now', '+18 days'), NULL, 'في انتظار الدفع', datetime('now', '-2 days'), datetime('now', '-2 days')),
('660e8400-e29b-41d4-a716-446655440006', 'GH-2024-006', 'token006', '550e8400-e29b-41d4-a716-446655440001', 'منتجات استهلاكية - ملابس وأحذية', 'sea', 'هانغتشو، الصين', 'طرابلس، ليبيا', 500.00, '100x80x60 cm', 3000.00, 1500.00, 150.00, 1650.00, 'delivered', 'paid', datetime('now', '-5 days'), datetime('now', '-2 days'), 'تم التسليم بنجاح', datetime('now', '-20 days'), datetime('now', '-20 days')),
('660e8400-e29b-41d4-a716-446655440007', 'GH-2024-007', 'token007', '550e8400-e29b-41d4-a716-446655440003', 'آلات زراعية - معدات ري', 'sea', 'شيان، الصين', 'القاهرة، مصر', 1800.00, '180x120x90 cm', 10000.00, 2500.00, 500.00, 3000.00, 'delayed', 'paid', datetime('now', '+5 days'), NULL, 'تأخير بسبب الطقس', datetime('now', '-12 days'), datetime('now', '-12 days'));

-- إضافة إعلانات تجريبية
INSERT INTO ads (id, title, description, image_url, link_url, active, views, clicks, start_date, end_date, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'خصم 20% على الشحن البحري', 'احصل على خصم 20% على جميع شحنات الحاويات البحرية لفترة محدودة', '/uploads/ad-sea-discount.jpg', '/services', true, 1250, 85, datetime('now', '-30 days'), datetime('now', '+30 days'), datetime('now', '-30 days'), datetime('now')),
('770e8400-e29b-41d4-a716-446655440002', 'خدمة الشحن السريع الجديدة', 'خدمة شحن جوي سريع - وصول خلال 3-5 أيام عمل', '/uploads/ad-fast-shipping.jpg', '/contact', true, 890, 62, datetime('now', '-20 days'), datetime('now', '+40 days'), datetime('now', '-20 days'), datetime('now')),
('770e8400-e29b-41d4-a716-446655440003', 'تأمين شامل على البضائع', 'احم شحنتك بتأمين شامل يغطي جميع المخاطر', '/uploads/ad-insurance.jpg', '/services', true, 650, 45, datetime('now', '-15 days'), datetime('now', '+45 days'), datetime('now', '-15 days'), datetime('now')),
('770e8400-e29b-41d4-a716-446655440004', 'خدمة التخليص الجمركي المجانية', 'تخليص جمركي مجاني للشحنات التي تزيد عن 5000 دولار', '/uploads/ad-customs-free.jpg', '/contact', false, 420, 28, datetime('now', '-45 days'), datetime('now', '-5 days'), datetime('now', '-45 days'), datetime('now', '-10 days'));

-- إضافة إعدادات الموقع
INSERT OR REPLACE INTO settings (id, key, value, description, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'site_name', 'شركة الحصان الذهبي للشحن', 'اسم الموقع', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440002', 'site_description', 'شركة رائدة في مجال الشحن البحري والجوي من الصين إلى ليبيا والدول العربية', 'وصف الموقع', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440003', 'contact_email', 'info@goldenhorse-shipping.com', 'البريد الإلكتروني للتواصل', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440004', 'contact_phone', '+86-138-0013-8000', 'رقم الهاتف للتواصل', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440005', 'contact_address', 'مكتب 1205، مبنى التجارة الدولية، شارع هوايهاي الشرقي، شنغهاي، الصين', 'عنوان المكتب الرئيسي', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440006', 'working_hours', 'الأحد - الخميس: 9:00 ص - 6:00 م (بتوقيت بكين)', 'ساعات العمل', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440007', 'facebook_url', 'https://facebook.com/goldenhorse.shipping', 'رابط صفحة فيسبوك', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440008', 'whatsapp_number', '+86-138-0013-8000', 'رقم واتساب للتواصل', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440009', 'wechat_id', 'GoldenHorse_Shipping', 'معرف وي تشات', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440010', 'logo_url', '/uploads/logo.png', 'رابط شعار الشركة', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440011', 'favicon_url', '/uploads/favicon.ico', 'رابط أيقونة الموقع', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440012', 'currency', 'USD', 'العملة المستخدمة', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440013', 'default_language', 'ar', 'اللغة الافتراضية', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440014', 'maintenance_mode', 'false', 'وضع الصيانة', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440015', 'google_analytics_id', '', 'معرف Google Analytics', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440016', 'smtp_host', '', 'خادم البريد الإلكتروني', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440017', 'smtp_port', '587', 'منفذ البريد الإلكتروني', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440018', 'smtp_username', '', 'اسم المستخدم للبريد الإلكتروني', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440019', 'smtp_password', '', 'كلمة مرور البريد الإلكتروني', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440020', 'backup_enabled', 'true', 'تفعيل النسخ الاحتياطي', datetime('now'), datetime('now')),
('880e8400-e29b-41d4-a716-446655440021', 'backup_frequency', 'daily', 'تكرار النسخ الاحتياطي', datetime('now'), datetime('now'));

-- إضافة مستخدم إداري للاختبار
INSERT INTO users (id, username, email, password, full_name, role, is_active, created_at, updated_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@goldenhorse-shipping.com', '$2b$10$K7L/8Y3IWQVYH2C1aGGULOxSr8kfTGjGzjzjzjzjzjzjzjzjzjzjzu', 'مدير النظام', 'admin', true, datetime('now'), datetime('now'));
