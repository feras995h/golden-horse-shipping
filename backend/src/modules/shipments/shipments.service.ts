import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Shipment, ShipmentStatus, PaymentStatus } from '../../entities/shipment.entity';
import { Client } from '../../entities/client.entity';
import { PaymentRecord, PaymentMethod } from '../../entities/payment-record.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { ShipsGoTrackingService } from '../shipsgo-tracking/shipsgo-tracking.service';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    private shipsGoTrackingService: ShipsGoTrackingService,
  ) {}

  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GH${timestamp}${random}`;
  }

  private generateTrackingToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    // Verify client exists
    const client = await this.clientRepository.findOne({
      where: { id: createShipmentDto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Generate unique tracking number
    let trackingNumber: string;
    let isUnique = false;
    
    while (!isUnique) {
      trackingNumber = this.generateTrackingNumber();
      const existing = await this.shipmentRepository.findOne({
        where: { trackingNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingNumber,
      trackingToken: this.generateTrackingToken(),
    });

    return this.shipmentRepository.save(shipment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ShipmentStatus,
    search?: string,
  ): Promise<{
    shipments: Shipment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.client', 'client')
      .leftJoinAndSelect('shipment.paymentRecords', 'paymentRecords');

    if (status) {
      queryBuilder.andWhere('shipment.status = :status', { status });
    }

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(shipment.trackingNumber) LIKE :search OR LOWER(shipment.description) LIKE :search OR LOWER(client.fullName) LIKE :search OR LOWER(shipment.originPort) LIKE :search OR LOWER(shipment.destinationPort) LIKE :search)',
        { search: searchLower },
      );
    }

    queryBuilder
      .orderBy('shipment.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const [shipments, total] = await queryBuilder.getManyAndCount();

    return {
      shipments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['client', 'paymentRecords'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async findByTrackingNumber(trackingNumber: string, token?: string): Promise<Shipment> {
    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.client', 'client')
      .leftJoinAndSelect('shipment.paymentRecords', 'paymentRecords')
      .where('shipment.trackingNumber = :trackingNumber', { trackingNumber });

    if (token) {
      queryBuilder.andWhere('shipment.trackingToken = :token', { token });
    }

    const shipment = await queryBuilder.getOne();

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    // If client is being changed, verify new client exists
    if (updateShipmentDto.clientId && updateShipmentDto.clientId !== shipment.clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: updateShipmentDto.clientId },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    await this.shipmentRepository.update(id, updateShipmentDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    const shipment = await this.findOne(id);
    
    // Update actual dates based on status
    const updateData: Partial<Shipment> = { status };
    
    if (status === ShipmentStatus.SHIPPED && !shipment.actualDeparture) {
      updateData.actualDeparture = new Date();
    }
    
    if (status === ShipmentStatus.DELIVERED && !shipment.actualArrival) {
      updateData.actualArrival = new Date();
    }

    await this.shipmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Shipment> {
    await this.shipmentRepository.update(id, { paymentStatus });
    return this.findOne(id);
  }

  async addPaymentRecord(shipmentId: string, createPaymentRecordDto: CreatePaymentRecordDto, recordedBy: string): Promise<PaymentRecord> {
    const shipment = await this.findOne(shipmentId);

    const paymentRecord = this.paymentRecordRepository.create({
      ...createPaymentRecordDto,
      shipmentId,
      recordedBy,
    });

    const savedRecord = await this.paymentRecordRepository.save(paymentRecord);

    // Update shipment payment status based on total payments
    await this.updateShipmentPaymentStatus(shipmentId);

    return savedRecord;
  }

  private async updateShipmentPaymentStatus(shipmentId: string): Promise<void> {
    const shipment = await this.findOne(shipmentId);
    const totalPaid = shipment.paymentRecords.reduce((sum, record) => sum + Number(record.amount), 0);
    const totalCost = Number(shipment.totalCost);

    let paymentStatus: PaymentStatus;
    if (totalPaid >= totalCost) {
      paymentStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else {
      paymentStatus = PaymentStatus.UNPAID;
    }

    await this.shipmentRepository.update(shipmentId, { paymentStatus });
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    
    // Check if shipment can be deleted (not in transit)
    if (shipment.status === ShipmentStatus.IN_TRANSIT || shipment.status === ShipmentStatus.SHIPPED) {
      throw new BadRequestException('Cannot delete shipment that is in transit');
    }

    await this.shipmentRepository.remove(shipment);
  }

  async generatePublicTrackingLink(id: string): Promise<string> {
    const shipment = await this.findOne(id);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/tracking/${shipment.trackingNumber}?token=${shipment.trackingToken}`;
  }

  async getStats(): Promise<{
    totalShipments: number;
    activeShipments: number;
    deliveredShipments: number;
    delayedShipments: number;
    shipmentsThisMonth: number;
    revenueThisMonth: number;
  }> {
    const totalShipments = await this.shipmentRepository.count();
    
    const activeShipments = await this.shipmentRepository.count({
      where: [
        { status: ShipmentStatus.PROCESSING },
        { status: ShipmentStatus.SHIPPED },
        { status: ShipmentStatus.IN_TRANSIT },
        { status: ShipmentStatus.AT_PORT },
        { status: ShipmentStatus.CUSTOMS_CLEARANCE },
      ],
    });

    const deliveredShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELIVERED },
    });

    const delayedShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELAYED },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const shipmentsThisMonth = await this.shipmentRepository.count({
      where: {
        createdAt: {
          $gte: startOfMonth,
        } as any,
      },
    });

    // Calculate revenue this month from paid shipments
    const paidShipmentsThisMonth = await this.shipmentRepository.find({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: {
          $gte: startOfMonth,
        } as any,
      },
    });

    const revenueThisMonth = paidShipmentsThisMonth.reduce(
      (sum, shipment) => sum + Number(shipment.totalCost),
      0,
    );

    return {
      totalShipments,
      activeShipments,
      deliveredShipments,
      delayedShipments,
      shipmentsThisMonth,
      revenueThisMonth,
    };
  }

  async getShipmentsByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      relations: ['client', 'paymentRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get real-time tracking data for a shipment using ShipsGo API
   */
  async getRealTimeTrackingData(shipmentId: string): Promise<any> {
    const shipment = await this.findOne(shipmentId);

    // If tracking is disabled or no tracking identifiers available, return basic data
    if (!shipment.enableTracking || (!shipment.containerNumber && !shipment.blNumber && !shipment.bookingNumber)) {
      return {
        success: true,
        data: {
          container_number: shipment.containerNumber || 'N/A',
          bl_number: shipment.blNumber || shipment.trackingNumber,
          booking_number: shipment.bookingNumber || shipment.trackingNumber,
          shipping_line: shipment.shippingLine || 'Golden Horse Shipping',
          vessel_name: shipment.vesselName || 'TBA',
          voyage: shipment.voyage || 'TBA',
          port_of_loading: shipment.originPort,
          port_of_discharge: shipment.destinationPort,
          estimated_departure: shipment.estimatedDeparture?.toISOString(),
          estimated_arrival: shipment.estimatedArrival?.toISOString(),
          actual_departure: shipment.actualDeparture?.toISOString(),
          actual_arrival: shipment.actualArrival?.toISOString(),
          status: this.mapShipmentStatusToTrackingStatus(shipment.status),
          milestones: this.generateMilestonesFromShipment(shipment),
          location: shipment.vesselMMSI ? {
            latitude: 0,
            longitude: 0,
            timestamp: new Date().toISOString()
          } : undefined,
        },
        shipmentInfo: {
          trackingNumber: shipment.trackingNumber,
          description: shipment.description,
          client: shipment.client?.fullName,
        },
      };
    }

    try {
      let trackingData;
      
      // Try different tracking methods based on available data
      if (shipment.containerNumber) {
        this.logger.log(`Tracking by container number: ${shipment.containerNumber}`);
        trackingData = await this.shipsGoTrackingService.trackByContainerNumber(shipment.containerNumber);
      } else if (shipment.blNumber) {
        this.logger.log(`Tracking by BL number: ${shipment.blNumber}`);
        trackingData = await this.shipsGoTrackingService.trackByBLNumber(shipment.blNumber);
      } else if (shipment.bookingNumber) {
        this.logger.log(`Tracking by booking number: ${shipment.bookingNumber}`);
        trackingData = await this.shipsGoTrackingService.trackByBookingNumber(shipment.bookingNumber);
      } else {
        throw new BadRequestException('No tracking identifiers available');
      }

      if (trackingData.success) {
        return {
          ...trackingData,
          shipmentInfo: {
            trackingNumber: shipment.trackingNumber,
            description: shipment.description,
            client: shipment.client?.fullName,
          },
        };
      }
      throw new BadRequestException('Failed to get tracking data from ShipsGo');
    } catch (error) {
      // Fallback to enhanced mock data if ShipsGo fails
      this.logger.warn(`ShipsGo tracking failed for shipment ${shipmentId}, using fallback data: ${error.message}`);
      return {
        success: true,
        data: {
          container_number: shipment.containerNumber || 'N/A',
          bl_number: shipment.blNumber || shipment.trackingNumber,
          booking_number: shipment.bookingNumber || shipment.trackingNumber,
          shipping_line: shipment.shippingLine || 'Golden Horse Shipping',
          vessel_name: shipment.vesselName || 'TBA',
          voyage: shipment.voyage || 'TBA',
          port_of_loading: shipment.originPort,
          port_of_discharge: shipment.destinationPort,
          estimated_departure: shipment.estimatedDeparture?.toISOString(),
          estimated_arrival: shipment.estimatedArrival?.toISOString(),
          actual_departure: shipment.actualDeparture?.toISOString(),
          actual_arrival: shipment.actualArrival?.toISOString(),
          status: this.mapShipmentStatusToTrackingStatus(shipment.status),
          milestones: this.generateMilestonesFromShipment(shipment),
          location: shipment.vesselMMSI ? {
            latitude: 0,
            longitude: 0,
            timestamp: new Date().toISOString()
          } : undefined,
        },
        shipmentInfo: {
          trackingNumber: shipment.trackingNumber,
          description: shipment.description,
          client: shipment.client?.fullName,
        },
      };
    }
  }

  /**
   * Get public tracking data by tracking number
   */
  async getPublicTrackingData(trackingNumber: string): Promise<any> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: ['client'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return this.getRealTimeTrackingData(shipment.id);
  }

  private mapShipmentStatusToTrackingStatus(status: ShipmentStatus): string {
    const statusMap = {
      [ShipmentStatus.PENDING]: 'Pending',
      [ShipmentStatus.PROCESSING]: 'Processing',
      [ShipmentStatus.SHIPPED]: 'Shipped',
      [ShipmentStatus.IN_TRANSIT]: 'In Transit',
      [ShipmentStatus.AT_PORT]: 'At Port',
      [ShipmentStatus.CUSTOMS_CLEARANCE]: 'Customs Clearance',
      [ShipmentStatus.DELIVERED]: 'Delivered',
      [ShipmentStatus.DELAYED]: 'Delayed',
      [ShipmentStatus.CANCELLED]: 'Cancelled',
    };
    return statusMap[status] || 'Unknown';
  }

  private generateMilestonesFromShipment(shipment: Shipment): any[] {
    const milestones = [];
    const now = new Date();

    // Add milestones based on shipment status
    if (shipment.status !== ShipmentStatus.PENDING) {
      milestones.push({
        event: 'Booking Confirmed',
        location: 'Office',
        date: shipment.createdAt.toISOString(),
        status: 'Completed',
        description: 'Shipment booking confirmed',
      });
    }

    if ([ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_PORT,
         ShipmentStatus.CUSTOMS_CLEARANCE, ShipmentStatus.DELIVERED].includes(shipment.status)) {
      milestones.push({
        event: 'Departed',
        location: shipment.originPort,
        date: shipment.estimatedDeparture?.toISOString() || shipment.createdAt.toISOString(),
        status: 'Completed',
        description: 'Vessel departed from origin port',
      });
    }

    if ([ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_PORT,
         ShipmentStatus.CUSTOMS_CLEARANCE, ShipmentStatus.DELIVERED].includes(shipment.status)) {
      milestones.push({
        event: 'In Transit',
        location: 'Sea',
        date: now.toISOString(),
        status: shipment.status === ShipmentStatus.IN_TRANSIT ? 'In Progress' : 'Completed',
        description: 'Container in transit',
      });
    }

    if ([ShipmentStatus.AT_PORT, ShipmentStatus.CUSTOMS_CLEARANCE, ShipmentStatus.DELIVERED].includes(shipment.status)) {
      milestones.push({
        event: 'Arrived at Port',
        location: shipment.destinationPort,
        date: shipment.estimatedArrival?.toISOString() || now.toISOString(),
        status: shipment.status === ShipmentStatus.AT_PORT ? 'In Progress' : 'Completed',
        description: 'Container arrived at destination port',
      });
    }

    if (shipment.status === ShipmentStatus.DELIVERED) {
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
}
