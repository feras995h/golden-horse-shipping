import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerPortalService } from './customer-portal.service';

@ApiTags('Public Tracking')
@Controller('public-tracking')
export class PublicTrackingController {
  constructor(private customerPortalService: CustomerPortalService) {}

  @Get(':trackingNumber')
  @ApiOperation({ summary: 'Get tracking information by tracking number (public endpoint)' })
  @ApiParam({ name: 'trackingNumber', description: 'Tracking number (container, BL, or booking number)' })
  @ApiResponse({ status: 200, description: 'Tracking information' })
  @ApiResponse({ status: 404, description: 'Tracking number not found' })
  async getTrackingByNumber(@Param('trackingNumber') trackingNumber: string) {
    // This endpoint allows anyone to track shipments using tracking numbers
    // without authentication for public access
    return this.customerPortalService.getPublicTracking(trackingNumber);
  }
}
