import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { Client } from '../../entities/client.entity';
import { Shipment } from '../../entities/shipment.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) {}

  private generateClientId(): string {
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `GH-${randomNum}`;
  }

  private generateTrackingNumber(): string {
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `MSKU${randomNum}`;
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Check if email already exists
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    // Generate unique client ID
    let clientId: string;
    let isUnique = false;
    
    while (!isUnique) {
      clientId = this.generateClientId();
      const existing = await this.clientRepository.findOne({
        where: { clientId },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Handle portal access
    let trackingNumber: string | null = null;
    let passwordHash: string | null = null;

    if (createClientDto.hasPortalAccess) {
      // Check if tracking number is provided
      if (createClientDto.trackingNumber) {
        // Check if tracking number already exists
        const existingTracking = await this.clientRepository.findOne({
          where: { trackingNumber: createClientDto.trackingNumber },
        });
        if (existingTracking) {
          throw new ConflictException('Client with this tracking number already exists');
        }
        trackingNumber = createClientDto.trackingNumber.toUpperCase();
      } else {
        // Generate unique tracking number
        let isTrackingUnique = false;
        while (!isTrackingUnique) {
          trackingNumber = this.generateTrackingNumber();
          const existing = await this.clientRepository.findOne({
            where: { trackingNumber },
          });
          if (!existing) {
            isTrackingUnique = true;
          }
        }
      }

      // Hash password if provided
      if (createClientDto.password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(createClientDto.password, saltRounds);
      }
    }

    const client = this.clientRepository.create({
      ...createClientDto,
      clientId,
      trackingNumber,
      passwordHash,
      hasPortalAccess: createClientDto.hasPortalAccess || false,
      lastLogin: null,
      directAccessToken: null,
      tokenExpiresAt: null,
    });

    return this.clientRepository.save(client);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, status?: 'active' | 'inactive'): Promise<{
    clients: Client[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (search) {
      queryBuilder.where(
        'client.fullName ILIKE :search OR client.email ILIKE :search OR client.clientId ILIKE :search OR client.company ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('client.isActive = :isActive', { isActive });
    }

    queryBuilder
      .orderBy('client.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const [clients, total] = await queryBuilder.getManyAndCount();

    return {
      clients,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['shipments'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async findByClientId(clientId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { clientId },
      relations: ['shipments'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async getClientShipments(clientId: string): Promise<Shipment[]> {
    const client = await this.findByClientId(clientId);
    
    return this.shipmentRepository.find({
      where: { clientId: client.id },
      order: { createdAt: 'DESC' },
      relations: ['paymentRecords'],
    });
  }

  /**
   * Get client shipments with enhanced tracking data
   */
  async getClientShipmentsWithTracking(clientId: string): Promise<any[]> {
    const shipments = await this.getClientShipments(clientId);
    
    // Enhance each shipment with tracking data
    const enhancedShipments = await Promise.all(
      shipments.map(async (shipment) => {
        try {
          // Get tracking data for each shipment
          const trackingData = await this.getShipmentTrackingData(shipment);
          return {
            ...shipment,
            trackingData
          };
        } catch (error) {
          // If tracking fails, return shipment without tracking data
          return shipment;
        }
      })
    );
    
    return enhancedShipments;
  }

  /**
   * Get tracking data for a single shipment
   */
  private async getShipmentTrackingData(shipment: Shipment): Promise<any> {
    // If no container number, return basic tracking info
    if (!shipment.containerNumber) {
      return {
        success: true,
        data: {
          container_number: 'N/A',
          bl_number: shipment.trackingNumber,
          booking_number: shipment.trackingNumber,
          shipping_line: 'Golden Horse Shipping',
          vessel_name: shipment.vesselName || 'TBA',
          status: this.mapShipmentStatusToTrackingStatus(shipment.status),
          port_of_loading: shipment.originPort,
          port_of_discharge: shipment.destinationPort,
          estimated_departure: shipment.estimatedDeparture?.toISOString(),
          estimated_arrival: shipment.estimatedArrival?.toISOString(),
          milestones: this.generateMilestonesFromShipment(shipment),
        }
      };
    }

    // Try to get real-time tracking data
    try {
      // This would require injecting ShipsGoTrackingService
      // For now, return basic data
      return {
        success: true,
        data: {
          container_number: shipment.containerNumber,
          bl_number: shipment.trackingNumber,
          booking_number: shipment.trackingNumber,
          shipping_line: 'Golden Horse Shipping',
          vessel_name: shipment.vesselName || 'TBA',
          status: this.mapShipmentStatusToTrackingStatus(shipment.status),
          port_of_loading: shipment.originPort,
          port_of_discharge: shipment.destinationPort,
          estimated_departure: shipment.estimatedDeparture?.toISOString(),
          estimated_arrival: shipment.estimatedArrival?.toISOString(),
          milestones: this.generateMilestonesFromShipment(shipment),
        }
      };
    } catch (error) {
      // Fallback to basic data
      return {
        success: true,
        data: {
          container_number: shipment.containerNumber,
          bl_number: shipment.trackingNumber,
          booking_number: shipment.trackingNumber,
          shipping_line: 'Golden Horse Shipping',
          vessel_name: shipment.vesselName || 'TBA',
          status: this.mapShipmentStatusToTrackingStatus(shipment.status),
          port_of_loading: shipment.originPort,
          port_of_discharge: shipment.destinationPort,
          estimated_departure: shipment.estimatedDeparture?.toISOString(),
          estimated_arrival: shipment.estimatedArrival?.toISOString(),
          milestones: this.generateMilestonesFromShipment(shipment),
        }
      };
    }
  }

  private mapShipmentStatusToTrackingStatus(status: string): string {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'in_transit': 'In Transit',
      'at_port': 'At Port',
      'customs_clearance': 'Customs Clearance',
      'delivered': 'Delivered',
      'delayed': 'Delayed',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || 'Unknown';
  }

  private generateMilestonesFromShipment(shipment: Shipment): any[] {
    const milestones = [];
    const now = new Date();

    // Add milestones based on shipment status
    if (shipment.status !== 'pending') {
      milestones.push({
        event: 'Booking Confirmed',
        location: 'Office',
        date: shipment.createdAt.toISOString(),
        status: 'Completed',
        description: 'Shipment booking confirmed',
      });
    }

    if (['shipped', 'in_transit', 'at_port', 'customs_clearance', 'delivered'].includes(shipment.status)) {
      milestones.push({
        event: 'Departed',
        location: shipment.originPort,
        date: shipment.estimatedDeparture?.toISOString() || shipment.createdAt.toISOString(),
        status: 'Completed',
        description: 'Vessel departed from origin port',
      });
    }

    if (['in_transit', 'at_port', 'customs_clearance', 'delivered'].includes(shipment.status)) {
      milestones.push({
        event: 'In Transit',
        location: 'Sea',
        date: now.toISOString(),
        status: shipment.status === 'in_transit' ? 'In Progress' : 'Completed',
        description: 'Container in transit',
      });
    }

    if (['at_port', 'customs_clearance', 'delivered'].includes(shipment.status)) {
      milestones.push({
        event: 'Arrived at Port',
        location: shipment.destinationPort,
        date: shipment.estimatedArrival?.toISOString() || now.toISOString(),
        status: shipment.status === 'at_port' ? 'In Progress' : 'Completed',
        description: 'Container arrived at destination port',
      });
    }

    if (shipment.status === 'delivered') {
      milestones.push({
        event: 'Delivered',
        location: shipment.destinationPort,
        date: now.toISOString(),
        status: 'Completed',
        description: 'Container delivered to consignee',
      });
    }

    return milestones;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    // Check if email is being changed and if it already exists
    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    await this.clientRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    
    // Check if client has active shipments
    const activeShipments = await this.shipmentRepository.count({
      where: { 
        clientId: id,
        status: 'in_transit' as any,
      },
    });

    if (activeShipments > 0) {
      throw new ConflictException('Cannot delete client with active shipments');
    }

    await this.clientRepository.remove(client);
  }

  async toggleStatus(id: string): Promise<Client> {
    const client = await this.findOne(id);
    await this.clientRepository.update(id, { isActive: !client.isActive });
    return this.findOne(id);
  }

  // Portal access management methods
  async enablePortalAccess(clientId: string, trackingNumber?: string, password?: string): Promise<Client> {
    const client = await this.findOne(clientId);

    if (client.hasPortalAccess) {
      throw new ConflictException('Client already has portal access');
    }

    let finalTrackingNumber: string;
    
    if (trackingNumber) {
      // Check if tracking number already exists
      const existingTracking = await this.clientRepository.findOne({
        where: { trackingNumber: trackingNumber.toUpperCase() },
      });
      if (existingTracking) {
        throw new ConflictException('Tracking number already exists');
      }
      finalTrackingNumber = trackingNumber.toUpperCase();
    } else {
      // Generate unique tracking number
      let isTrackingUnique = false;
      while (!isTrackingUnique) {
        finalTrackingNumber = this.generateTrackingNumber();
        const existing = await this.clientRepository.findOne({
          where: { trackingNumber: finalTrackingNumber },
        });
        if (!existing) {
          isTrackingUnique = true;
        }
      }
    }

    let passwordHash: string | null = null;
    if (password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await this.clientRepository.update(clientId, {
      hasPortalAccess: true,
      trackingNumber: finalTrackingNumber,
      passwordHash,
    });

    return this.findOne(clientId);
  }

  async disablePortalAccess(clientId: string): Promise<Client> {
    const client = await this.findOne(clientId);

    if (!client.hasPortalAccess) {
      throw new ConflictException('Client does not have portal access');
    }

    await this.clientRepository.update(clientId, {
      hasPortalAccess: false,
      trackingNumber: null,
      passwordHash: null,
      lastLogin: null,
      directAccessToken: null,
      tokenExpiresAt: null,
    });

    return this.findOne(clientId);
  }

  async changePassword(clientId: string, newPassword: string): Promise<Client> {
    const client = await this.findOne(clientId);

    if (!client.hasPortalAccess) {
      throw new ConflictException('Client does not have portal access');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.clientRepository.update(clientId, {
      passwordHash,
    });

    return this.findOne(clientId);
  }

  async getClientByTrackingNumber(trackingNumber: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { 
        trackingNumber: trackingNumber.toUpperCase(),
        hasPortalAccess: true,
        isActive: true,
      },
    });
  }

  async getStats(): Promise<{
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    clientsThisMonth: number;
  }> {
    const totalClients = await this.clientRepository.count();
    const activeClients = await this.clientRepository.count({
      where: { isActive: true },
    });
    const inactiveClients = totalClients - activeClients;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const clientsThisMonth = await this.clientRepository.count({
      where: {
        createdAt: {
          $gte: startOfMonth,
        } as any,
      },
    });

    return {
      totalClients,
      activeClients,
      inactiveClients,
      clientsThisMonth,
    };
  }
}
