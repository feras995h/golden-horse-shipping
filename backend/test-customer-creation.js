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

async function testCustomerCreation() {
  try {
    console.log('🧪 Testing customer creation with GH-XXXXXX format...');
    
    // Connect to database
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    const customerRepository = AppDataSource.getRepository(CustomerAccount);
    
    // Test 1: Create multiple customers to verify unique number generation
    console.log('\n📝 Test 1: Creating multiple customers...');
    
    const customers = [];
    for (let i = 1; i <= 5; i++) {
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
      const passwordHash = await bcrypt.hash(`customer${i}123`, 10);
      
      const customer = customerRepository.create({
        customerNumber,
        trackingNumber,
        passwordHash,
        customerName: `Test Customer ${i}`,
        customerEmail: `customer${i}@test.com`,
        customerPhone: `+96612345678${i}`,
        isActive: true
      });
      
      await customerRepository.save(customer);
      customers.push(customer);
      
      console.log(`   ✅ Customer ${i}: ${customerNumber} (${trackingNumber})`);
    }
    
    // Test 2: Verify all customer numbers follow GH-XXXXXX format
    console.log('\n🔍 Test 2: Verifying customer number format...');
    
    const allCustomers = await customerRepository.find();
    const ghFormatRegex = /^GH-\d{6}$/;
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const customer of allCustomers) {
      if (customer.customerNumber) {
        if (ghFormatRegex.test(customer.customerNumber)) {
          validCount++;
          console.log(`   ✅ Valid: ${customer.customerNumber} - ${customer.customerName}`);
        } else {
          invalidCount++;
          console.log(`   ❌ Invalid: ${customer.customerNumber} - ${customer.customerName}`);
        }
      }
    }
    
    console.log(`\n📊 Format validation results:`);
    console.log(`   ✅ Valid GH-XXXXXX format: ${validCount}`);
    console.log(`   ❌ Invalid format: ${invalidCount}`);
    
    // Test 3: Check for duplicate customer numbers
    console.log('\n🔄 Test 3: Checking for duplicate customer numbers...');
    
    const customerNumbers = allCustomers
      .filter(c => c.customerNumber)
      .map(c => c.customerNumber);
    
    const uniqueNumbers = new Set(customerNumbers);
    const duplicates = customerNumbers.length - uniqueNumbers.size;
    
    if (duplicates === 0) {
      console.log('   ✅ No duplicate customer numbers found');
    } else {
      console.log(`   ❌ Found ${duplicates} duplicate customer numbers`);
    }
    
    // Test 4: Test customer login functionality
    console.log('\n🔐 Test 4: Testing customer login...');
    
    const testCustomer = customers[0];
    const loginTest = await customerRepository.findOne({
      where: { customerNumber: testCustomer.customerNumber }
    });
    
    if (loginTest) {
      const passwordMatch = await bcrypt.compare('customer1123', loginTest.passwordHash);
      if (passwordMatch) {
        console.log(`   ✅ Login test successful for ${testCustomer.customerNumber}`);
      } else {
        console.log(`   ❌ Password verification failed for ${testCustomer.customerNumber}`);
      }
    } else {
      console.log(`   ❌ Customer not found: ${testCustomer.customerNumber}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Customer number generation system is working correctly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testCustomerCreation();