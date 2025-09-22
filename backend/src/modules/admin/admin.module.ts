import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerManagementController } from './customer-management.controller';
import { CustomerManagementService } from './customer-management.service';
import { ShipmentManagementController } from './shipment-management.controller';
import { ShipmentManagementService } from './shipment-management.service';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { Shipment } from '../../entities/shipment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerAccount, Shipment]),
    AuthModule,
  ],
  controllers: [CustomerManagementController, ShipmentManagementController],
  providers: [CustomerManagementService, ShipmentManagementService],
  exports: [CustomerManagementService, ShipmentManagementService],
})
export class AdminModule {}
