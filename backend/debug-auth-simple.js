const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');

// استيراد الكيانات المطلوبة
const { CustomerAccount } = require('./dist/entities/customer-account.entity');
const { Shipment } = require('./dist/entities/shipment.entity');
const { Client } = require('./dist/entities/client.entity');
const { User } = require('./dist/entities/user.entity');
const { Ad } = require('./dist/entities/ad.entity');
const { PaymentRecord } = require('./dist/entities/payment-record.entity');
const { Setting } = require('./dist/entities/setting.entity');

async function debugAuthSimple() {
  console.log('🔍 تشخيص مبسط لمشكلة المصادقة\n');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, 'database.sqlite'),
    entities: [CustomerAccount, Shipment, Client, User, Ad, PaymentRecord, Setting],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    const customerRepo = dataSource.getRepository(CustomerAccount);

    // اختبار 1: البحث بدون شروط
    console.log('\n1️⃣ البحث عن العميل بدون شروط...');
    const customer = await customerRepo.findOne({
      where: { trackingNumber: 'MSKU4603728' }
    });

    if (!customer) {
      console.log('❌ لم يتم العثور على العميل');
      return;
    }

    console.log('✅ تم العثور على العميل:');
    console.log(`   المعرف: ${customer.id}`);
    console.log(`   رقم التتبع: ${customer.trackingNumber}`);
    console.log(`   اسم العميل: ${customer.customerName}`);
    console.log(`   نشط: ${customer.isActive} (نوع: ${typeof customer.isActive})`);
    console.log(`   له صلاحية دخول: ${customer.hasPortalAccess} (نوع: ${typeof customer.hasPortalAccess})`);

    // اختبار 2: التحقق من كلمة المرور
    console.log('\n2️⃣ التحقق من كلمة المرور...');
    const passwordValid = await bcrypt.compare('customer123', customer.passwordHash);
    console.log(`   كلمة المرور صحيحة: ${passwordValid ? '✅' : '❌'}`);

    // اختبار 3: محاكاة منطق المصادقة الجديد
    console.log('\n3️⃣ محاكاة منطق المصادقة الجديد...');
    const authResult = customer && 
                      customer.isActive && 
                      customer.hasPortalAccess && 
                      passwordValid;
    
    console.log(`   نتيجة المصادقة: ${authResult ? '✅ نجح' : '❌ فشل'}`);

    // اختبار 4: اختبار مع الاستعلام المباشر
    console.log('\n4️⃣ اختبار مع الاستعلام المباشر...');
    const directQuery = await dataSource.query(
      'SELECT * FROM customer_accounts WHERE tracking_number = ?',
      ['MSKU4603728']
    );
    
    if (directQuery.length > 0) {
      const dbCustomer = directQuery[0];
      console.log('✅ العميل موجود في قاعدة البيانات:');
      console.log(`   is_active: ${dbCustomer.is_active} (نوع: ${typeof dbCustomer.is_active})`);
      console.log(`   has_portal_access: ${dbCustomer.has_portal_access} (نوع: ${typeof dbCustomer.has_portal_access})`);
      
      const dbPasswordValid = await bcrypt.compare('customer123', dbCustomer.password_hash);
      console.log(`   كلمة المرور صحيحة: ${dbPasswordValid ? '✅' : '❌'}`);
    }

    await dataSource.destroy();

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

debugAuthSimple();