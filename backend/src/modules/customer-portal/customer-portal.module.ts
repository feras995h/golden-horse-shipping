import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPortalController } from './customer-portal.controller';
import { PublicTrackingController } from './public-tracking.controller';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { Shipment } from '../../entities/shipment.entity';
import { PaymentRecord } from '../../entities/payment-record.entity';
import { ShipsGoTrackingModule } from '../shipsgo-tracking/shipsgo-tracking.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerAccount, Shipment, PaymentRecord]),
    ShipsGoTrackingModule,
    CustomerAuthModule,
  ],
  controllers: [CustomerPortalController, PublicTrackingController],
  providers: [CustomerPortalService],
  exports: [CustomerPortalService],
})
export class CustomerPortalModule {}
