const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CustomerAuthService } = require('./dist/modules/customer-auth/customer-auth.service');

async function debugAuthService() {
    console.log('🔍 Testing authentication service directly...');
    
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const customerAuthService = app.get(CustomerAuthService);
        
        console.log('✅ NestJS application context created');
        console.log('✅ CustomerAuthService retrieved');
        
        // Test validateCustomer method
        console.log('\n🔍 Testing validateCustomer method...');
        const result = await customerAuthService.validateCustomer('MSKU4603728', 'customer123');
        
        console.log('🎯 Validation result:', result);
        
        if (result) {
            console.log('✅ Customer validation successful');
            console.log('Customer details:', {
                id: result.id,
                trackingNumber: result.trackingNumber,
                customerName: result.customerName,
                isActive: result.isActive,
                hasPortalAccess: result.hasPortalAccess
            });
        } else {
            console.log('❌ Customer validation failed');
        }
        
        // Test login method
        console.log('\n🔍 Testing login method...');
        try {
            const loginResult = await customerAuthService.login({
                trackingNumber: 'MSKU4603728',
                password: 'customer123'
            });
            console.log('✅ Login successful:', loginResult);
        } catch (error) {
            console.log('❌ Login failed:', error.message);
        }
        
        await app.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugAuthService().catch(console.error);