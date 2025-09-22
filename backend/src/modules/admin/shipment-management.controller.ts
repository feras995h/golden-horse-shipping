import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ShipmentManagementService } from './shipment-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin - Shipment Management')
@Controller('admin/shipments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShipmentManagementController {
  constructor(private shipmentManagementService: ShipmentManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all shipments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by tracking number or description' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Filter by customer ID' })
  @ApiResponse({ status: 200, description: 'Shipments list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllShipments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.shipmentManagementService.getAllShipments(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
      search,
      status,
      customerId,
    );
  }

  @Get(':shipmentId')
  @ApiOperation({ summary: 'Get shipment details' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async getShipmentById(@Param('shipmentId') shipmentId: string) {
    return this.shipmentManagementService.getShipmentById(shipmentId);
  }

  @Put(':shipmentId/status')
  @ApiOperation({ summary: 'Update shipment status manually' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'processing', 'shipped', 'in_transit', 'at_port', 'customs_clearance', 'delivered', 'delayed', 'cancelled'],
          description: 'New shipment status' 
        },
        notes: { type: 'string', description: 'Optional notes for the status update' },
        actualArrival: { type: 'string', format: 'date-time', description: 'Actual arrival date (for delivered status)' },
        actualDeparture: { type: 'string', format: 'date-time', description: 'Actual departure date (for shipped status)' },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Shipment status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateShipmentStatus(
    @Param('shipmentId') shipmentId: string,
    @Body() updateStatusDto: {
      status: string;
      notes?: string;
      actualArrival?: string;
      actualDeparture?: string;
    },
    @Request() req,
  ) {
    return this.shipmentManagementService.updateShipmentStatus(
      shipmentId,
      updateStatusDto,
      req.user.id,
    );
  }

  @Put(':shipmentId/location')
  @ApiOperation({ summary: 'Update shipment location manually' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentLocation: { type: 'string', description: 'Current location of the shipment' },
        estimatedArrival: { type: 'string', format: 'date-time', description: 'Updated estimated arrival' },
        vesselName: { type: 'string', description: 'Current vessel name' },
        vesselMmsi: { type: 'string', description: 'Vessel MMSI number' },
        notes: { type: 'string', description: 'Optional notes for the location update' },
      },
      required: ['currentLocation'],
    },
  })
  @ApiResponse({ status: 200, description: 'Shipment location updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateShipmentLocation(
    @Param('shipmentId') shipmentId: string,
    @Body() updateLocationDto: {
      currentLocation: string;
      estimatedArrival?: string;
      vesselName?: string;
      vesselMmsi?: string;
      notes?: string;
    },
    @Request() req,
  ) {
    return this.shipmentManagementService.updateShipmentLocation(
      shipmentId,
      updateLocationDto,
      req.user.id,
    );
  }

  @Post(':shipmentId/warehouse-arrival')
  @ApiOperation({ summary: 'Mark shipment as arrived at company warehouse' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        arrivalDate: { type: 'string', format: 'date-time', description: 'Warehouse arrival date (default: now)' },
        warehouseLocation: { type: 'string', description: 'Warehouse location/section' },
        condition: { 
          type: 'string', 
          enum: ['excellent', 'good', 'fair', 'damaged'],
          description: 'Condition of goods upon arrival' 
        },
        notes: { type: 'string', description: 'Notes about the arrival and condition' },
        disableTracking: { type: 'boolean', description: 'Disable real-time tracking (default: true)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Shipment marked as arrived at warehouse' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async markWarehouseArrival(
    @Param('shipmentId') shipmentId: string,
    @Body() warehouseArrivalDto: {
      arrivalDate?: string;
      warehouseLocation?: string;
      condition?: string;
      notes?: string;
      disableTracking?: boolean;
    },
    @Request() req,
  ) {
    return this.shipmentManagementService.markWarehouseArrival(
      shipmentId,
      warehouseArrivalDto,
      req.user.id,
    );
  }

  @Put(':shipmentId/tracking-settings')
  @ApiOperation({ summary: 'Update shipment tracking settings' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enableTracking: { type: 'boolean', description: 'Enable/disable real-time tracking' },
        containerNumber: { type: 'string', description: 'Container number for tracking' },
        blNumber: { type: 'string', description: 'Bill of Lading number' },
        bookingNumber: { type: 'string', description: 'Booking reference number' },
      },
      required: ['enableTracking'],
    },
  })
  @ApiResponse({ status: 200, description: 'Tracking settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateTrackingSettings(
    @Param('shipmentId') shipmentId: string,
    @Body() trackingSettingsDto: {
      enableTracking: boolean;
      containerNumber?: string;
      blNumber?: string;
      bookingNumber?: string;
    },
    @Request() req,
  ) {
    return this.shipmentManagementService.updateTrackingSettings(
      shipmentId,
      trackingSettingsDto,
      req.user.id,
    );
  }

  @Get(':shipmentId/update-history')
  @ApiOperation({ summary: 'Get shipment manual update history' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Shipment update history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async getShipmentUpdateHistory(
    @Param('shipmentId') shipmentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shipmentManagementService.getShipmentUpdateHistory(
      shipmentId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Put(':shipmentId')
  @ApiOperation({ summary: 'Update shipment details' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Shipment description' },
        weight: { type: 'number', description: 'Shipment weight' },
        volume: { type: 'number', description: 'Shipment volume' },
        value: { type: 'number', description: 'Shipment value' },
        currency: { type: 'string', description: 'Currency code' },
        originPort: { type: 'string', description: 'Origin port' },
        destinationPort: { type: 'string', description: 'Destination port' },
        estimatedDeparture: { type: 'string', format: 'date-time', description: 'Estimated departure' },
        estimatedArrival: { type: 'string', format: 'date-time', description: 'Estimated arrival' },
        specialInstructions: { type: 'string', description: 'Special handling instructions' },
        notes: { type: 'string', description: 'Additional notes' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Shipment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateShipment(
    @Param('shipmentId') shipmentId: string,
    @Body() updateShipmentDto: any,
    @Request() req,
  ) {
    return this.shipmentManagementService.updateShipment(
      shipmentId,
      updateShipmentDto,
      req.user.id,
    );
  }
}
