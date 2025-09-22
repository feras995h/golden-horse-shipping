import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { CustomerPortalModule } from './modules/customer-portal/customer-portal.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { AdsModule } from './modules/ads/ads.module';
import { ReportsModule } from './modules/reports/reports.module';

import { ShipsGoTrackingModule } from './modules/shipsgo-tracking/shipsgo-tracking.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    CustomerAuthModule,
    CustomerPortalModule,
    AdminModule,
    ClientsModule,
    ShipmentsModule,
    AdsModule,
    ReportsModule,

    ShipsGoTrackingModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
