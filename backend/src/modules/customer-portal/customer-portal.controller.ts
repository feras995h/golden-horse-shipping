import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
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
import { CustomerPortalService } from './customer-portal.service';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';

@ApiTags('Customer Portal')
@Controller('customer-portal')
@UseGuards(CustomerJwtAuthGuard)
@ApiBearerAuth()
export class CustomerPortalController {
  constructor(private customerPortalService: CustomerPortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get customer dashboard with statistics and recent shipments' })
  @ApiResponse({ status: 200, description: 'Customer dashboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getDashboard(@Request() req) {
    return this.customerPortalService.getCustomerDashboard(req.user.customerId);
  }

  @Get('shipments')
  @ApiOperation({ summary: 'Get customer shipments with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Customer shipments list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getShipments(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerPortalService.getCustomerShipments(
      req.user.customerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('shipments/:shipmentId')
  @ApiOperation({ summary: 'Get detailed shipment information' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found or access denied' })
  async getShipmentDetails(
    @Request() req,
    @Param('shipmentId') shipmentId: string,
  ) {
    return this.customerPortalService.getShipmentDetails(req.user.customerId, shipmentId);
  }

  @Get('shipments/:shipmentId/tracking')
  @ApiOperation({ summary: 'Get real-time tracking information for a shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Real-time tracking data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Real-time tracking not enabled for this shipment' })
  @ApiResponse({ status: 404, description: 'Shipment not found or access denied' })
  async getShipmentTracking(
    @Request() req,
    @Param('shipmentId') shipmentId: string,
  ) {
    return this.customerPortalService.getShipmentTracking(req.user.customerId, shipmentId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get customer profile information' })
  @ApiResponse({ status: 200, description: 'Customer profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getProfile(@Request() req) {
    return this.customerPortalService.getCustomerProfile(req.user.customerId);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change customer password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string', description: 'Current password' },
        newPassword: { type: 'string', description: 'New password' },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid current password' })
  async changePassword(
    @Body() changePasswordDto: { currentPassword: string; newPassword: string },
    @Request() req,
  ) {
    return this.customerPortalService.changePassword(req.user.customerId, changePasswordDto);
  }

  @Get('financial-data')
  @ApiOperation({ summary: 'Get customer financial data and statistics' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Customer financial data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getFinancialData(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerPortalService.getCustomerFinancialData(
      req.user.customerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('payment-history')
  @ApiOperation({ summary: 'Get customer payment history' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Customer payment history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getPaymentHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerPortalService.getCustomerPaymentHistory(
      req.user.customerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }
}
