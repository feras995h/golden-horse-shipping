import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerAuthService } from './customer-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CustomerLoginDto,
  CustomerNumberLoginDto,
  CustomerDirectAccessDto,
  CreateCustomerAccountDto,
  UpdateCustomerPasswordDto,
  CustomerChangePasswordDto,
  GenerateDirectLinkDto,
} from './dto/customer-login.dto';

@ApiTags('Customer Authentication')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private customerAuthService: CustomerAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Customer login with tracking number and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: CustomerLoginDto) {
    return this.customerAuthService.login(loginDto);
  }

  @Post('login-customer-number')
  @ApiOperation({ summary: 'Customer login with customer number and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithCustomerNumber(@Body() loginDto: CustomerNumberLoginDto) {
    return this.customerAuthService.loginWithCustomerNumber(loginDto);
  }

  @Post('direct-access')
  @ApiOperation({ summary: 'Customer login with direct access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async directAccess(@Body() directAccessDto: CustomerDirectAccessDto) {
    return this.customerAuthService.loginWithDirectToken(directAccessDto);
  }

  @Post('create-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create customer account (Admin only)' })
  @ApiResponse({ status: 201, description: 'Customer account created successfully' })
  @ApiResponse({ status: 409, description: 'Account already exists' })
  async createAccount(@Body() createDto: CreateCustomerAccountDto) {
    return this.customerAuthService.createCustomerAccount(createDto);
  }

  @Put('password/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer password (Admin only)' })
  @ApiParam({ name: 'trackingNumber', description: 'Customer tracking number' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async updatePassword(
    @Param('trackingNumber') trackingNumber: string,
    @Body() updateDto: UpdateCustomerPasswordDto,
  ) {
    return this.customerAuthService.updatePassword(trackingNumber, updateDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer password (Customer only)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async changePassword(
    @Request() req: any,
    @Body() changeDto: CustomerChangePasswordDto,
  ) {
    return this.customerAuthService.changePassword(req.user.sub, changeDto);
  }

  @Post('generate-link/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate direct access link for customer (Admin only)' })
  @ApiParam({ name: 'trackingNumber', description: 'Customer tracking number' })
  @ApiResponse({ status: 200, description: 'Direct link generated successfully' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async generateDirectLink(
    @Param('trackingNumber') trackingNumber: string,
    @Body() generateDto: GenerateDirectLinkDto,
  ) {
    return this.customerAuthService.generateDirectLink(trackingNumber, generateDto);
  }

  @Get('customer/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer account details (Admin only)' })
  @ApiParam({ name: 'trackingNumber', description: 'Customer tracking number' })
  @ApiResponse({ status: 200, description: 'Customer account details' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async getCustomer(@Param('trackingNumber') trackingNumber: string) {
    return this.customerAuthService.getCustomerByTrackingNumber(trackingNumber);
  }

  @Get('customers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all customer accounts (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of customer accounts' })
  async getAllCustomers() {
    return this.customerAuthService.getAllCustomerAccounts();
  }

  @Delete('customer/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete customer account (Admin only)' })
  @ApiParam({ name: 'trackingNumber', description: 'Customer tracking number' })
  @ApiResponse({ status: 200, description: 'Customer account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer account not found' })
  async deleteCustomer(@Param('trackingNumber') trackingNumber: string) {
    return this.customerAuthService.deleteCustomerAccount(trackingNumber);
  }
}
