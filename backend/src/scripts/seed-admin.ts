import { DataSource } from 'typeorm';
import { createAdminUser } from '../seeds/create-admin';
import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { Shipment } from '../entities/shipment.entity';
import { Ad } from '../entities/ad.entity';
import { PaymentRecord } from '../entities/payment-record.entity';
import { Setting } from '../entities/setting.entity';
import { CustomerAccount } from '../entities/customer-account.entity';

const dataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
  synchronize: true,
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
    await createAdminUser(dataSource);
    
    await dataSource.destroy();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
