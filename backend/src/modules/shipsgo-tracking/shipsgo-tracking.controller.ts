import { Controller, Get, Param, Query, Logger, UseGuards, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ShipsGoTrackingService, ShipsGoTrackingResponse } from './shipsgo-tracking.service';
import { ShipsGoRateLimitGuard } from '../../common/guards/shipsgo-rate-limit.guard';
import { ContainerParamDto } from './dto/container-param.dto';
import { BLParamDto } from './dto/bl-param.dto';
import { BookingParamDto } from './dto/booking-param.dto';
import { TrackQueryDto } from './dto/track-query.dto';

@ApiTags('ShipsGo Tracking')
@Controller('shipsgo-tracking')
@UseGuards(ShipsGoRateLimitGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ShipsGoTrackingController {
  private readonly logger = new Logger(ShipsGoTrackingController.name);

  constructor(private readonly shipsGoTrackingService: ShipsGoTrackingService) {}

  @Get('container/:containerNumber')
  @ApiOperation({ summary: 'Track container by container number' })
  @ApiParam({ name: 'containerNumber', description: 'Container number to track' })
  @ApiResponse({ status: 200, description: 'Container tracking data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  async trackByContainerNumber(@Param() params: ContainerParamDto): Promise<ShipsGoTrackingResponse> {
    const { containerNumber } = params;
    this.logger.log(`Tracking container: ${containerNumber}`);
    return this.shipsGoTrackingService.trackByContainerNumber(containerNumber.toUpperCase());
  }

  @Get('bl/:blNumber')
  @ApiOperation({ summary: 'Track container by Bill of Lading number' })
  @ApiParam({ name: 'blNumber', description: 'Bill of Lading number to track' })
  @ApiResponse({ status: 200, description: 'Container tracking data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bill of Lading not found' })
  async trackByBLNumber(@Param() params: BLParamDto): Promise<ShipsGoTrackingResponse> {
    const { blNumber } = params;
    this.logger.log(`Tracking BL: ${blNumber}`);
    return this.shipsGoTrackingService.trackByBLNumber(blNumber.toUpperCase());
  }

  @Get('booking/:bookingNumber')
  @ApiOperation({ summary: 'Track container by booking number' })
  @ApiParam({ name: 'bookingNumber', description: 'Booking number to track' })
  @ApiResponse({ status: 200, description: 'Container tracking data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async trackByBookingNumber(@Param() params: BookingParamDto): Promise<ShipsGoTrackingResponse> {
    const { bookingNumber } = params;
    this.logger.log(`Tracking booking: ${bookingNumber}`);
    return this.shipsGoTrackingService.trackByBookingNumber(bookingNumber.toUpperCase());
  }

  @Get('vessel/:mmsi/position')
  @ApiOperation({ summary: 'Get vessel position by MMSI' })
  @ApiParam({ name: 'mmsi', description: 'MMSI number of the vessel' })
  @ApiResponse({ status: 200, description: 'Vessel position retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async getVesselPosition(@Param('mmsi') mmsi: string) {
    this.logger.log(`Getting vessel position for MMSI: ${mmsi}`);
    return this.shipsGoTrackingService.getVesselPosition(mmsi);
  }

  @Get('track')
  @ApiOperation({ summary: 'Track shipment by any identifier' })
  @ApiQuery({ name: 'container', required: false, description: 'Container number' })
  @ApiQuery({ name: 'bl', required: false, description: 'Bill of Lading number' })
  @ApiQuery({ name: 'booking', required: false, description: 'Booking number' })
  @ApiResponse({ status: 200, description: 'Shipment tracking data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'No tracking identifier provided' })
  async trackShipment(
    @Query() query: TrackQueryDto,
  ): Promise<ShipsGoTrackingResponse> {
    const { container, bl, booking } = query;

    if (container) {
      this.logger.log(`Tracking by container: ${container}`);
      return this.shipsGoTrackingService.trackByContainerNumber(container.toUpperCase());
    }
    if (bl) {
      this.logger.log(`Tracking by BL: ${bl}`);
      return this.shipsGoTrackingService.trackByBLNumber(bl.toUpperCase());
    }
    if (booking) {
      this.logger.log(`Tracking by booking: ${booking}`);
      return this.shipsGoTrackingService.trackByBookingNumber(booking.toUpperCase());
    }

    throw new BadRequestException('No tracking identifier provided. Provide container, bl, or booking.');
  }

  @Get('health')
  @ApiOperation({ summary: 'ShipsGo integration health' })
  @ApiResponse({ status: 200, description: 'Health status' })
  getHealth() {
    return this.shipsGoTrackingService.getHealth();
  }

}
