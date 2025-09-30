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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all clients with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive',
  ) {
    return this.clientsService.findAll(page, limit, search, status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client statistics' })
  getStats() {
    return this.clientsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Get(':clientId/shipments')
  @ApiOperation({ summary: 'Get all shipments for a client (public access)' })
  @ApiResponse({ status: 200, description: 'Client shipments retrieved successfully' })
  getClientShipments(@Param('clientId') clientId: string) {
    return this.clientsService.getClientShipments(clientId);
  }

  @Get(':clientId/shipments-with-tracking')
  @ApiOperation({ summary: 'Get all shipments for a client with enhanced tracking data' })
  @ApiResponse({ status: 200, description: 'Client shipments with tracking data retrieved successfully' })
  getClientShipmentsWithTracking(@Param('clientId') clientId: string) {
    return this.clientsService.getClientShipmentsWithTracking(clientId);
  }

  @Get('by-client-id/:clientId')
  @ApiOperation({ summary: 'Get client by client ID (public access)' })
  findByClientId(@Param('clientId') clientId: string) {
    return this.clientsService.findByClientId(clientId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle client active status' })
  toggleStatus(@Param('id') id: string) {
    return this.clientsService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete client' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  // Portal access management endpoints
  @Post(':id/enable-portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable portal access for client' })
  @ApiResponse({ status: 200, description: 'Portal access enabled successfully' })
  enablePortalAccess(
    @Param('id') id: string,
    @Body() body: { trackingNumber?: string; password?: string }
  ) {
    return this.clientsService.enablePortalAccess(id, body.trackingNumber, body.password);
  }

  @Post(':id/disable-portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable portal access for client' })
  @ApiResponse({ status: 200, description: 'Portal access disabled successfully' })
  disablePortalAccess(@Param('id') id: string) {
    return this.clientsService.disablePortalAccess(id);
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change client portal password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @Param('id') id: string,
    @Body() body: { password: string }
  ) {
    return this.clientsService.changePassword(id, body.password);
  }

  @Post(':id/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset client portal password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  resetPassword(@Param('id') id: string) {
    return this.clientsService.resetPassword(id);
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({ summary: 'Get client by tracking number' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getClientByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.clientsService.getClientByTrackingNumber(trackingNumber);
  }
}
