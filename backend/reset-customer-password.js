const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Production database configuration
const DATABASE_CONFIG = {
  user: 'postgres',
  host: '72.60.92.146',
  database: 'postgres',
  password: 'A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l',
  port: 5433,
};

async function resetCustomerPassword() {
  console.log('🔧 إعادة تعيين كلمة مرور العميل...\n');

  try {
    const client = new Client(DATABASE_CONFIG);
    await client.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Reset password for the first customer
    const customerNumber = 'GH-249109';
    const newPassword = 'customer123';
    
    console.log(`\n🔑 إعادة تعيين كلمة المرور للعميل: ${customerNumber}`);
    console.log(`🔑 كلمة المرور الجديدة: ${newPassword}`);

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('✅ تم تشفير كلمة المرور الجديدة');

    // Update the customer's password
    const updateResult = await client.query(`
      UPDATE customer_accounts 
      SET password_hash = $1, updated_at = NOW()
      WHERE customer_number = $2
      RETURNING id, customer_number, customer_name, tracking_number
    `, [passwordHash, customerNumber]);

    if (updateResult.rows.length === 0) {
      console.log('❌ لم يتم العثور على العميل');
      await client.end();
      return;
    }

    const customer = updateResult.rows[0];
    console.log('✅ تم تحديث كلمة المرور بنجاح:');
    console.log(`   - رقم العميل: ${customer.customer_number}`);
    console.log(`   - اسم العميل: ${customer.customer_name}`);
    console.log(`   - رقم التتبع: ${customer.tracking_number}`);

    // Verify the password works
    console.log('\n🔍 فحص كلمة المرور الجديدة...');
    const verifyQuery = await client.query(`
      SELECT password_hash FROM customer_accounts WHERE customer_number = $1
    `, [customerNumber]);

    const isPasswordValid = await bcrypt.compare(newPassword, verifyQuery.rows[0].password_hash);
    console.log(`✅ فحص كلمة المرور: ${isPasswordValid ? 'صحيحة' : 'خاطئة'}`);

    // Also reset password for other test customers
    const otherCustomers = ['GH-485194', 'GH-971289'];
    
    for (const custNum of otherCustomers) {
      console.log(`\n🔑 إعادة تعيين كلمة المرور للعميل: ${custNum}`);
      
      const updateOtherResult = await client.query(`
        UPDATE customer_accounts 
        SET password_hash = $1, updated_at = NOW()
        WHERE customer_number = $2
        RETURNING customer_number, customer_name
      `, [passwordHash, custNum]);

      if (updateOtherResult.rows.length > 0) {
        console.log(`✅ تم تحديث كلمة المرور للعميل: ${updateOtherResult.rows[0].customer_name}`);
      } else {
        console.log(`❌ لم يتم العثور على العميل: ${custNum}`);
      }
    }

    await client.end();
    console.log('\n🎉 تم الانتهاء من إعادة تعيين كلمات المرور');
    console.log('📝 يمكنك الآن اختبار تسجيل الدخول بكلمة المرور: customer123');

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error.message);
  }
}

// Run the reset
resetCustomerPassword().catch(console.error);