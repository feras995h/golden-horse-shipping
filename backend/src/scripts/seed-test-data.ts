import { DataSource } from 'typeorm';
import { Client } from '../entities/client.entity';
import { Shipment, ShipmentStatus, PaymentStatus, ShipmentType } from '../entities/shipment.entity';
import { Ad, AdStatus } from '../entities/ad.entity';
import { AppDataSource } from '../config/database.config';

async function seedTestData() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    const clientRepository = AppDataSource.getRepository(Client);
    const shipmentRepository = AppDataSource.getRepository(Shipment);
    const adRepository = AppDataSource.getRepository(Ad);

    // Create test clients
    console.log('Creating test clients...');
    const clients = [];
    for (let i = 1; i <= 5; i++) {
      const client = clientRepository.create({
        clientId: `CLIENT${i.toString().padStart(3, '0')}`,
        fullName: `عميل تجريبي ${i}`,
        email: `client${i}@example.com`,
        phone: `+966${Math.floor(Math.random() * 1000000000)}`,
        company: `شركة ${i}`,
        addressLine1: `العنوان ${i}`,
        city: 'الرياض',
        country: 'السعودية',
        postalCode: '12345',
        isActive: true,
      });
      clients.push(await clientRepository.save(client));
    }

    // Create test shipments
    console.log('Creating test shipments...');
    const statuses = [
      ShipmentStatus.PENDING,
      ShipmentStatus.PROCESSING,
      ShipmentStatus.SHIPPED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.DELAYED,
    ];

    const paymentStatuses = [PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.PARTIAL];
    const shipmentTypes = [ShipmentType.SEA, ShipmentType.AIR, ShipmentType.LAND];

    for (let i = 1; i <= 20; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const type = shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)];

      const shipment = shipmentRepository.create({
        trackingNumber: `GH${Date.now()}${i}`,
        trackingToken: `token_${Date.now()}_${i}`,
        clientId: client.id,
        description: `شحنة تجريبية ${i}`,
        type,
        status,
        paymentStatus,
        originPort: 'جدة',
        destinationPort: 'الدمام',
        weight: Math.floor(Math.random() * 1000) + 100,
        value: Math.floor(Math.random() * 10000) + 2000,
        currency: 'SAR',
        totalCost: Math.floor(Math.random() * 5000) + 1000,
        estimatedDeparture: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        estimatedArrival: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      });

      await shipmentRepository.save(shipment);
    }

    // Create test ads
    console.log('Creating test ads...');
    for (let i = 1; i <= 3; i++) {
      const ad = adRepository.create({
        title: `إعلان تجريبي ${i}`,
        description: `وصف الإعلان التجريبي ${i}`,
        status: AdStatus.ACTIVE,
        displayOrder: i,
        viewCount: Math.floor(Math.random() * 1000),
        clickCount: Math.floor(Math.random() * 100),
        createdBy: 'admin',
      });
      
      await adRepository.save(ad);
    }

    console.log('Test data seeded successfully!');
    console.log(`Created ${clients.length} clients, 20 shipments, and 3 ads`);
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedTestData();
