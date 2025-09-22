import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShipmentStatus, PaymentStatus } from '../../entities/shipment.entity';

@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shipments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ShipmentStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ShipmentStatus,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.shipmentsService.findAll(pageNum, limitNum, status, search);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment statistics' })
  getStats() {
    return this.shipmentsService.getStats();
  }

  @Get(':trackingNumber/public')
  @ApiOperation({ summary: 'Get shipment by tracking number (public access)' })
  @ApiQuery({ name: 'token', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Shipment details retrieved successfully' })
  findByTrackingNumber(
    @Param('trackingNumber') trackingNumber: string,
    @Query('token') token?: string,
  ) {
    return this.shipmentsService.findByTrackingNumber(trackingNumber, token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment by ID' })
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Get(':id/tracking-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate public tracking link for shipment' })
  generateTrackingLink(@Param('id') id: string) {
    return this.shipmentsService.generatePublicTrackingLink(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment' })
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, updateShipmentDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment status' })
  updateStatus(@Param('id') id: string, @Body('status') status: ShipmentStatus) {
    return this.shipmentsService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment payment status manually' })
  updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: PaymentStatus) {
    return this.shipmentsService.updatePaymentStatus(id, paymentStatus);
  }

  @Post(':id/payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add payment record to shipment' })
  addPaymentRecord(
    @Param('id') id: string,
    @Body() createPaymentRecordDto: CreatePaymentRecordDto,
    @Request() req,
  ) {
    return this.shipmentsService.addPaymentRecord(id, createPaymentRecordDto, req.user.username);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete shipment' })
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }

  @Get(':id/tracking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time tracking data for shipment' })
  @ApiResponse({ status: 200, description: 'Real-time tracking data retrieved successfully' })
  getRealTimeTracking(@Param('id') id: string) {
    return this.shipmentsService.getRealTimeTrackingData(id);
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Get public tracking data by tracking number' })
  @ApiParam({ name: 'trackingNumber', description: 'Tracking number of the shipment' })
  @ApiResponse({ status: 200, description: 'Public tracking data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  getPublicTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.getPublicTrackingData(trackingNumber);
  }
}
