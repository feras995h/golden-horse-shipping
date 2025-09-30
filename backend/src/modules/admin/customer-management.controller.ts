import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
import { CustomerManagementService } from './customer-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin - Customer Management')
@Controller('admin/customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerManagementController {
  constructor(private customerManagementService: CustomerManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customer accounts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by tracking number or name' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Customer accounts list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.customerManagementService.getAllCustomers(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
      search,
      status,
    );
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Get customer account details' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiResponse({ status: 200, description: 'Customer account details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('customerId') customerId: string) {
    return this.customerManagementService.getCustomerById(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new customer account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trackingNumber: { type: 'string', description: 'Customer tracking number' },
        customerName: { type: 'string', description: 'Customer full name' },
        customerEmail: { type: 'string', description: 'Customer email address' },
        customerPhone: { type: 'string', description: 'Customer phone number' },
        password: { type: 'string', description: 'Customer password' },
      },
      required: ['trackingNumber', 'customerName', 'customerEmail', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Customer account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Customer with tracking number already exists' })
  async createCustomer(
    @Body() createCustomerDto: {
      trackingNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      password: string;
    },
    @Request() req,
  ) {
    return this.customerManagementService.createCustomer(createCustomerDto, req.user.id);
  }

  @Put(':customerId')
  @ApiOperation({ summary: 'Update customer account information' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: 'Customer full name' },
        customerEmail: { type: 'string', description: 'Customer email address' },
        customerPhone: { type: 'string', description: 'Customer phone number' },
        isActive: { type: 'boolean', description: 'Customer account status' },
        hasPortalAccess: { type: 'boolean', description: 'Customer portal access status' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Customer account updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('customerId') customerId: string,
    @Body() updateCustomerDto: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      isActive?: boolean;
      hasPortalAccess?: boolean;
    },
    @Request() req,
  ) {
    return this.customerManagementService.updateCustomer(customerId, updateCustomerDto, req.user.id);
  }

  @Put(':customerId/password')
  @ApiOperation({ summary: 'Reset customer password' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string', description: 'New password for the customer' },
      },
      required: ['newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async resetCustomerPassword(
    @Param('customerId') customerId: string,
    @Body() resetPasswordDto: { newPassword: string },
    @Request() req,
  ) {
    return this.customerManagementService.resetCustomerPassword(
      customerId,
      resetPasswordDto.newPassword,
      req.user.id,
    );
  }

  @Post(':customerId/direct-link')
  @ApiOperation({ summary: 'Generate direct access link for customer' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expiresInHours: { type: 'number', description: 'Link expiration time in hours (default: 24)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Direct access link generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async generateDirectLink(
    @Param('customerId') customerId: string,
    @Body() generateLinkDto: { expiresInHours?: number },
    @Request() req,
  ) {
    return this.customerManagementService.generateDirectLink(
      customerId,
      generateLinkDto.expiresInHours || 24,
      req.user.id,
    );
  }

  @Get(':customerId/shipments')
  @ApiOperation({ summary: 'Get customer shipments' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Customer shipments list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerShipments(
    @Param('customerId') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerManagementService.getCustomerShipments(
      customerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Delete(':customerId')
  @ApiOperation({ summary: 'Delete customer account' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiResponse({ status: 200, description: 'Customer account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deleteCustomer(@Param('customerId') customerId: string, @Request() req) {
    return this.customerManagementService.deleteCustomer(customerId, req.user.id);
  }

  @Get(':customerId/activity-log')
  @ApiOperation({ summary: 'Get customer activity log' })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Customer activity log' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerActivityLog(
    @Param('customerId') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerManagementService.getCustomerActivityLog(
      customerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Patch(':customerId/change-password')
  @ApiOperation({
    summary: 'Change customer password',
    description: 'Change customer account password (admin only)',
  })
  @ApiParam({ name: 'customerId', description: 'Customer account ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', description: 'New password' },
      },
      required: ['password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async changeCustomerPassword(
    @Param('customerId') customerId: string,
    @Body() changePasswordDto: { password: string },
    @Request() req,
  ) {
    return this.customerManagementService.changeCustomerPassword(customerId, changePasswordDto.password, req.user.id);
  }
}
