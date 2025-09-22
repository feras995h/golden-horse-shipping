import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

import { ReportsService, ReportFilters } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShipmentStatus, PaymentStatus } from '../../entities/shipment.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('shipments')
  @ApiOperation({ summary: 'Get shipments report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ShipmentStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  getShipmentsReport(@Query() query: any) {
    const filters: ReportFilters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      status: query.status,
      paymentStatus: query.paymentStatus,
      clientId: query.clientId,
    };

    return this.reportsService.getShipmentsReport(filters);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payments report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  getPaymentsReport(@Query() query: any) {
    const filters: ReportFilters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      clientId: query.clientId,
    };

    return this.reportsService.getPaymentsReport(filters);
  }

  @Get('shipments/export')
  @ApiOperation({ summary: 'Export shipments report to CSV' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ShipmentStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  async exportShipmentsReport(@Query() query: any, @Res() res: Response) {
    const filters: ReportFilters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      status: query.status,
      paymentStatus: query.paymentStatus,
      clientId: query.clientId,
    };

    const filePath = await this.reportsService.exportShipmentsToCSV(filters);
    return res.json({ downloadUrl: filePath });
  }

  @Get('payments/export')
  @ApiOperation({ summary: 'Export payments report to CSV' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  async exportPaymentsReport(@Query() query: any, @Res() res: Response) {
    const filters: ReportFilters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      clientId: query.clientId,
    };

    const filePath = await this.reportsService.exportPaymentsToCSV(filters);
    return res.json({ downloadUrl: filePath });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('delayed-shipments')
  @ApiOperation({ summary: 'Get delayed shipments' })
  @ApiResponse({ status: 200, description: 'Delayed shipments retrieved successfully' })
  getDelayedShipments() {
    return this.reportsService.getDelayedShipments();
  }

  @Get('unpaid-shipments')
  @ApiOperation({ summary: 'Get unpaid shipments' })
  @ApiResponse({ status: 200, description: 'Unpaid shipments retrieved successfully' })
  getUnpaidShipments() {
    return this.reportsService.getUnpaidShipments();
  }
}
