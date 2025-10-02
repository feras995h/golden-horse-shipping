import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { Shipment } from '../entities/shipment.entity';
import { Ad } from '../entities/ad.entity';
import { PaymentRecord } from '../entities/payment-record.entity';
import { Setting } from '../entities/setting.entity';
import { CustomerAccount } from '../entities/customer-account.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get('NODE_ENV', 'development');
    const databaseUrl = this.configService.get('DATABASE_URL');
    const isPostgres = !!databaseUrl || !!this.configService.get('DB_HOST') || this.configService.get('DB_TYPE') === 'postgres';
    const synchronize = this.configService.get('DB_SYNCHRONIZE') === 'true' || (nodeEnv !== 'production' && this.configService.get('DB_SYNCHRONIZE') !== 'false');

    console.log('🔍 Database Configuration Debug:');
    console.log('  - NODE_ENV:', nodeEnv);
    console.log('  - DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('  - DB_HOST:', this.configService.get('DB_HOST'));
    console.log('  - DB_TYPE:', this.configService.get('DB_TYPE'));
    console.log('  - Is PostgreSQL:', isPostgres);
    console.log('  - Synchronize:', synchronize);

    if (isPostgres) {
      // Try to use individual variables first for more reliability
      const dbHost = this.configService.get('DB_HOST');
      const dbUsername = this.configService.get('DB_USERNAME');
      const dbPassword = this.configService.get('DB_PASSWORD');
      const dbName = this.configService.get('DB_NAME') || this.configService.get('DB_DATABASE');
      const dbPort = parseInt(this.configService.get('DB_PORT', '5432'), 10);

      // Prefer individual variables if all are provided
      if (dbHost && dbUsername && dbPassword && dbName) {
        console.log('✅ Using individual database variables');
        const sslEnabled = this.configService.get('DB_SSL') === 'true';
        const rejectUnauthorized = this.configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false';
        
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
          synchronize,
          logging: nodeEnv === 'development',
          ssl: sslEnabled ? ({ rejectUnauthorized } as any) : false,
        } as any;
      }

      // If DATABASE_URL is provided and individual vars are not complete, use it
      if (databaseUrl) {
        console.log('✅ Using DATABASE_URL');
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
          synchronize,
          logging: nodeEnv === 'development',
          ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=verify-full') ? { rejectUnauthorized: false } : false,
        } as any;
      }

      throw new Error('PostgreSQL configuration incomplete: Either provide DATABASE_URL or all individual variables (DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME)');
    }

    console.log('✅ Using SQLite database');
    return {
      type: 'sqlite',
      database: this.configService.get('DB_PATH', './database.sqlite'),
      entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
      synchronize,
      logging: nodeEnv === 'development',
    };
  }
}

// DataSource for migrations
const isProd = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;
const isPg = !!databaseUrl || !!process.env.DB_HOST || process.env.DB_TYPE === 'postgres';

// Get individual database variables
const dbHost = process.env.DB_HOST;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const hasIndividualVars = dbHost && dbUsername && dbPassword && dbName;

const dataSourceOptions: DataSourceOptions = isPg
  ? hasIndividualVars
    ? {
        type: 'postgres',
        host: dbHost,
        port: dbPort,
        username: dbUsername,
        password: dbPassword,
        database: dbName,
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
        synchronize: false,
        ssl: process.env.DB_SSL === 'true' ? ({ rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } as any) : false,
      }
    : databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
        synchronize: false,
        ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=verify-full') ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'sqlite',
        database: process.env.DB_PATH || './database.sqlite',
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
        synchronize: false,
      }
  : {
      type: 'sqlite',
      database: process.env.DB_PATH || './database.sqlite',
      entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
      migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
      synchronize: false,
    };

export const AppDataSource = new DataSource(dataSourceOptions);
