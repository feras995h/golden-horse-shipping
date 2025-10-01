const { DataSource } = require('typeorm');
const { CustomerAccount } = require('./dist/entities/customer-account.entity');
const bcrypt = require('bcrypt');
const path = require('path');

async function debugAuthIssue() {
  console.log('🔍 تشخيص مشكلة المصادقة\n');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, 'database.sqlite'),
    entities: [CustomerAccount],
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

    // اختبار 3: التحقق من الشروط المنطقية
    console.log('\n3️⃣ التحقق من الشروط المنطقية...');
    console.log(`   customer.isActive === true: ${customer.isActive === true}`);
    console.log(`   customer.isActive == true: ${customer.isActive == true}`);
    console.log(`   Boolean(customer.isActive): ${Boolean(customer.isActive)}`);
    console.log(`   customer.hasPortalAccess === true: ${customer.hasPortalAccess === true}`);
    console.log(`   customer.hasPortalAccess == true: ${customer.hasPortalAccess == true}`);
    console.log(`   Boolean(customer.hasPortalAccess): ${Boolean(customer.hasPortalAccess)}`);

    // اختبار 4: محاكاة منطق المصادقة
    console.log('\n4️⃣ محاكاة منطق المصادقة...');
    const authResult = customer && 
                      customer.isActive && 
                      customer.hasPortalAccess && 
                      passwordValid;
    
    console.log(`   نتيجة المصادقة: ${authResult ? '✅ نجح' : '❌ فشل'}`);

    // اختبار 5: اختبار مع القيم الصريحة
    console.log('\n5️⃣ اختبار مع القيم الصريحة...');
    console.log(`   customer.isActive && customer.hasPortalAccess: ${customer.isActive && customer.hasPortalAccess}`);
    console.log(`   !!customer.isActive && !!customer.hasPortalAccess: ${!!customer.isActive && !!customer.hasPortalAccess}`);

    // اختبار 6: البحث مع الشروط المنطقية
    console.log('\n6️⃣ البحث مع الشروط المنطقية...');
    
    const customerWithBooleans = await customerRepo.findOne({
      where: { 
        trackingNumber: 'MSKU4603728',
        isActive: true,
        hasPortalAccess: true 
      }
    });
    
    console.log(`   البحث مع true: ${customerWithBooleans ? '✅ وُجد' : '❌ لم يوجد'}`);

    const customerWithNumbers = await customerRepo.findOne({
      where: { 
        trackingNumber: 'MSKU4603728',
        isActive: 1,
        hasPortalAccess: 1
      }
    });
    
    console.log(`   البحث مع 1: ${customerWithNumbers ? '✅ وُجد' : '❌ لم يوجد'}`);

    await dataSource.destroy();

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    console.error('تفاصيل الخطأ:', error.stack);
  }
}

debugAuthIssue();