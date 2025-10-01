const { DataSource } = require('typeorm');
const { CustomerAccount } = require('./dist/entities/customer-account.entity');

async function checkCustomerAccounts() {
  console.log('🔍 Checking Customer Accounts in Database...\n');

  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [CustomerAccount],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const customerRepository = dataSource.getRepository(CustomerAccount);
    
    // Get all customer accounts
    const customers = await customerRepository.find({
      take: 10,
      order: { createdAt: 'DESC' }
    });

    console.log(`\n📊 Found ${customers.length} customer accounts:`);
    console.log('='.repeat(80));

    customers.forEach((customer, index) => {
      console.log(`${index + 1}. Customer Account:`);
      console.log(`   ID: ${customer.id}`);
      console.log(`   Tracking Number: ${customer.trackingNumber}`);
      console.log(`   Customer Name: ${customer.customerName}`);
      console.log(`   Customer Number: ${customer.customerNumber || 'N/A'}`);
      console.log(`   Email: ${customer.customerEmail || 'N/A'}`);
      console.log(`   Phone: ${customer.customerPhone || 'N/A'}`);
      console.log(`   Is Active: ${customer.isActive}`);
      console.log(`   Has Portal Access: ${customer.hasPortalAccess}`);
      console.log(`   Has Password: ${customer.passwordHash ? 'Yes' : 'No'}`);
      console.log(`   Created: ${customer.createdAt}`);
      console.log(`   Last Login: ${customer.lastLogin || 'Never'}`);
      console.log('   ' + '-'.repeat(60));
    });

    // Check for MSKU4603728 specifically
    console.log('\n🔍 Checking for MSKU4603728 specifically...');
    const mskuCustomer = await customerRepository.findOne({
      where: { trackingNumber: 'MSKU4603728' }
    });

    if (mskuCustomer) {
      console.log('✅ Found MSKU4603728 customer:');
      console.log(`   ID: ${mskuCustomer.id}`);
      console.log(`   Name: ${mskuCustomer.customerName}`);
      console.log(`   Is Active: ${mskuCustomer.isActive}`);
      console.log(`   Has Portal Access: ${mskuCustomer.hasPortalAccess}`);
      console.log(`   Has Password: ${mskuCustomer.passwordHash ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ MSKU4603728 customer not found');
    }

    await dataSource.destroy();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

checkCustomerAccounts();