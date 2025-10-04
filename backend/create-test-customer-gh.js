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
  synchronize: true,
});

async function createTestCustomer() {
  try {
    console.log('🔄 Creating test customer with GH-XXXXXX format...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const customerAccountRepository = AppDataSource.getRepository(CustomerAccount);

    // Generate customer number in GH-XXXXXX format
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const customerNumber = `GH-${randomNum}`;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('customer123', saltRounds);

    // Check if customer already exists
    const existingCustomer = await customerAccountRepository.findOne({
      where: { trackingNumber: 'MSKU4603728' }
    });

    if (existingCustomer) {
      // Update existing customer with new customer number
      existingCustomer.customerNumber = customerNumber;
      await customerAccountRepository.save(existingCustomer);
      console.log(`✅ Updated existing customer: ${existingCustomer.customerName}`);
      console.log(`   Customer Number: ${customerNumber}`);
      console.log(`   Tracking Number: ${existingCustomer.trackingNumber}`);
      console.log(`   Password: customer123`);
    } else {
      // Create new customer
      const newCustomer = customerAccountRepository.create({
        trackingNumber: 'MSKU4603728',
        customerNumber,
        passwordHash,
        customerName: 'Test Customer for GH Format',
        customerEmail: 'customer@example.com',
        customerPhone: '+1234567890',
        isActive: true,
        notes: 'Test customer account with GH-XXXXXX format'
      });

      const savedCustomer = await customerAccountRepository.save(newCustomer);
      console.log(`✅ Created new customer: ${savedCustomer.customerName}`);
      console.log(`   Customer Number: ${customerNumber}`);
      console.log(`   Tracking Number: ${savedCustomer.trackingNumber}`);
      console.log(`   Password: customer123`);
    }

    await AppDataSource.destroy();
    console.log('✅ Test customer created successfully!');

  } catch (error) {
    console.error('❌ Error creating test customer:', error.message);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

createTestCustomer();