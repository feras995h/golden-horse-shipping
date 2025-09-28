import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Shipment } from '../../entities/shipment.entity';
import { Client } from '../../entities/client.entity';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { PaymentRecord } from '../../entities/payment-record.entity';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { ShipsGoTrackingModule } from '../shipsgo-tracking/shipsgo-tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, Client, CustomerAccount, PaymentRecord]),
    ShipsGoTrackingModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
