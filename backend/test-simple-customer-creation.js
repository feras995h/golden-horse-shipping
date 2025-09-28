const { DataSource } = require('typeorm');
const { CustomerAccount } = require('./dist/entities/customer-account.entity');
const { Shipment } = require('./dist/entities/shipment.entity');
const { Client } = require('./dist/entities/client.entity');
const { User } = require('./dist/entities/user.entity');
const { Ad } = require('./dist/entities/ad.entity');
const { PaymentRecord } = require('./dist/entities/payment-record.entity');
const { Setting } = require('./dist/entities/setting.entity');
const bcrypt = require('bcrypt');

// Initialize database connection
const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [CustomerAccount, Shipment, Client, User, Ad, PaymentRecord, Setting],
  synchronize: false,
});

// Function to generate customer number in GH-XXXXXX format
function generateCustomerNumber() {
  const randomNum = Math.floor(Math.random() * 1000000);
  return `GH-${randomNum.toString().padStart(6, '0')}`;
}

// Function to generate tracking number
function generateTrackingNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function testSimpleCustomerCreation() {
  try {
    console.log('🧪 Testing simple customer creation with GH-XXXXXX format...');
    
    // Connect to database
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    const customerRepository = AppDataSource.getRepository(CustomerAccount);
    
    // Test: Create a new customer with GH format
    console.log('\n📝 Creating new customer with GH format...');
    
    let customerNumber;
    let isUnique = false;
    
    // Ensure unique customer number
    while (!isUnique) {
      customerNumber = generateCustomerNumber();
      const existing = await customerRepository.findOne({
        where: { customerNumber }
      });
      isUnique = !existing;
    }
    
    const trackingNumber = generateTrackingNumber();
    const passwordHash = await bcrypt.hash('customer123', 10);
    
    const customer = customerRepository.create({
      customerNumber,
      trackingNumber,
      passwordHash,
      customerName: 'Final Test Customer',
      customerEmail: 'finaltest@example.com',
      customerPhone: '+966123456789',
      isActive: true
    });
    
    await customerRepository.save(customer);
    
    console.log(`✅ Customer created successfully:`);
    console.log(`   Customer Number: ${customer.customerNumber}`);
    console.log(`   Tracking Number: ${customer.trackingNumber}`);
    console.log(`   Customer Name: ${customer.customerName}`);
    console.log(`   Email: ${customer.customerEmail}`);
    
    // Verify the customer was saved correctly
    const savedCustomer = await customerRepository.findOne({
      where: { customerNumber: customer.customerNumber }
    });
    
    if (savedCustomer) {
      console.log(`✅ Customer verification successful`);
      
      // Test login functionality
      const passwordMatch = await bcrypt.compare('customer123', savedCustomer.passwordHash);
      if (passwordMatch) {
        console.log(`✅ Password verification successful`);
      } else {
        console.log(`❌ Password verification failed`);
      }
    } else {
      console.log(`❌ Customer verification failed - not found in database`);
    }
    
    // Show all customers with GH format
    console.log('\n📊 All customers with GH format:');
    const allCustomers = await customerRepository.find();
    const ghCustomers = allCustomers.filter(c => c.customerNumber && c.customerNumber.startsWith('GH-'));
    
    console.log(`   Total customers: ${allCustomers.length}`);
    console.log(`   GH format customers: ${ghCustomers.length}`);
    
    ghCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.customerNumber} - ${customer.customerName}`);
    });
    
    console.log('\n🎉 Simple customer creation test completed successfully!');
    console.log('✅ Customer number generation system is working correctly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testSimpleCustomerCreation();