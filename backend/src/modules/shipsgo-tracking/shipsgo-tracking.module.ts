import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShipsGoTrackingService } from './shipsgo-tracking.service';
import { ShipsGoTrackingController } from './shipsgo-tracking.controller';

@Module({
  imports: [HttpModule],
  controllers: [ShipsGoTrackingController],
  providers: [ShipsGoTrackingService],
  exports: [ShipsGoTrackingService],
})
export class ShipsGoTrackingModule {}
