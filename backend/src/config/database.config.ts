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

    if (isPostgres) {
      // If DATABASE_URL is provided, use it
      if (databaseUrl) {
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
          synchronize,
          logging: nodeEnv === 'development',
          ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=verify-full') ? { rejectUnauthorized: false } : false,
        } as any;
      }

      // Fallback to individual variables
      const sslEnabled = this.configService.get('DB_SSL') === 'true';
      const rejectUnauthorized = this.configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false';
      return {
        type: 'postgres',
        host: this.configService.get('DB_HOST'),
        port: parseInt(this.configService.get('DB_PORT', '5432'), 10),
        username: this.configService.get('DB_USERNAME'),
        password: this.configService.get('DB_PASSWORD'),
        database: this.configService.get('DB_NAME'),
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        synchronize,
        logging: nodeEnv === 'development',
        ssl: sslEnabled ? ({ rejectUnauthorized } as any) : false,
      } as any;
    }

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

const dataSourceOptions: DataSourceOptions = isPg
  ? databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
        synchronize: false,
        ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=verify-full') ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
        migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
        synchronize: false,
        ssl: process.env.DB_SSL === 'true' ? ({ rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } as any) : false,
      }
  : {
      type: 'sqlite',
      database: process.env.DB_PATH || './database.sqlite',
      entities: [User, Client, Shipment, Ad, PaymentRecord, Setting, CustomerAccount],
      migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
      synchronize: false,
    };

export const AppDataSource = new DataSource(dataSourceOptions);
