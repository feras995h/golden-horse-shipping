import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Shipment } from '../../entities/shipment.entity';
import { Client } from '../../entities/client.entity';
import { PaymentRecord } from '../../entities/payment-record.entity';
import { Ad } from '../../entities/ad.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Client, PaymentRecord, Ad])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
