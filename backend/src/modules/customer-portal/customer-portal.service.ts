import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { Shipment } from '../../entities/shipment.entity';
import { PaymentRecord } from '../../entities/payment-record.entity';
import { ShipsGoTrackingService } from '../shipsgo-tracking/shipsgo-tracking.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerPortalService {
  constructor(
    @InjectRepository(CustomerAccount)
    private customerAccountRepository: Repository<CustomerAccount>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    private shipsGoTrackingService: ShipsGoTrackingService,
  ) {}

  async getCustomerDashboard(customerId: string) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
      relations: ['shipments'],
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Get shipment statistics
    const totalShipments = customerAccount.shipments.length;
    const activeShipments = customerAccount.shipments.filter(
      shipment => !['delivered', 'cancelled'].includes(shipment.status)
    ).length;
    const deliveredShipments = customerAccount.shipments.filter(
      shipment => shipment.status === 'delivered'
    ).length;

    // Get financial statistics
    const financialStats = await this.getCustomerFinancialStats(customerId);

    // Get recent shipments (last 5)
    const recentShipments = customerAccount.shipments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(shipment => ({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        description: shipment.description,
        status: shipment.status,
        originPort: shipment.originPort,
        destinationPort: shipment.destinationPort,
        estimatedArrival: shipment.estimatedArrival,
        createdAt: shipment.createdAt,
      }));

    return {
      customer: {
        id: customerAccount.id,
        trackingNumber: customerAccount.trackingNumber,
        customerName: customerAccount.customerName,
        customerEmail: customerAccount.customerEmail,
        customerPhone: customerAccount.customerPhone,
      },
      statistics: {
        totalShipments,
        activeShipments,
        deliveredShipments,
        ...financialStats,
      },
      recentShipments,
    };
  }

  async getCustomerShipments(customerId: string, page: number = 1, limit: number = 10) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    const [shipments, total] = await this.shipmentRepository.findAndCount({
      where: { customerAccountId: customerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      shipments: shipments.map(shipment => ({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        description: shipment.description,
        status: shipment.status,
        type: shipment.type,
        originPort: shipment.originPort,
        destinationPort: shipment.destinationPort,
        weight: shipment.weight,
        volume: shipment.volume,
        value: shipment.value,
        currency: shipment.currency,
        totalCost: shipment.totalCost,
        paymentStatus: shipment.paymentStatus,
        estimatedDeparture: shipment.estimatedDeparture,
        actualDeparture: shipment.actualDeparture,
        estimatedArrival: shipment.estimatedArrival,
        actualArrival: shipment.actualArrival,
        containerNumber: shipment.containerNumber,
        blNumber: shipment.blNumber,
        bookingNumber: shipment.bookingNumber,
        shippingLine: shipment.shippingLine,
        voyage: shipment.voyage,
        vesselName: shipment.vesselName,
        vesselMMSI: shipment.vesselMMSI,
        vesselIMO: shipment.vesselIMO,
        enableTracking: shipment.enableTracking,
        notes: shipment.notes,
        specialInstructions: shipment.specialInstructions,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShipmentDetails(customerId: string, shipmentId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId, customerAccountId: customerId },
      relations: ['paymentRecords'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found or access denied');
    }

    return {
      shipment: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        description: shipment.description,
        status: shipment.status,
        type: shipment.type,
        originPort: shipment.originPort,
        destinationPort: shipment.destinationPort,
        weight: shipment.weight,
        volume: shipment.volume,
        value: shipment.value,
        currency: shipment.currency,
        totalCost: shipment.totalCost,
        paymentStatus: shipment.paymentStatus,
        estimatedDeparture: shipment.estimatedDeparture,
        actualDeparture: shipment.actualDeparture,
        estimatedArrival: shipment.estimatedArrival,
        actualArrival: shipment.actualArrival,
        containerNumber: shipment.containerNumber,
        blNumber: shipment.blNumber,
        bookingNumber: shipment.bookingNumber,
        shippingLine: shipment.shippingLine,
        voyage: shipment.voyage,
        vesselName: shipment.vesselName,
        vesselMMSI: shipment.vesselMMSI,
        vesselIMO: shipment.vesselIMO,
        enableTracking: shipment.enableTracking,
        notes: shipment.notes,
        specialInstructions: shipment.specialInstructions,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      },
      paymentRecords: shipment.paymentRecords.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.paymentDate,
        method: payment.method,
        referenceNumber: payment.referenceNumber,
        notes: payment.notes,
        recordedBy: payment.recordedBy,
        createdAt: payment.createdAt,
      })),
    };
  }

  async getShipmentTracking(customerId: string, shipmentId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId, customerAccountId: customerId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found or access denied');
    }

    if (!shipment.enableTracking) {
      throw new ForbiddenException('Real-time tracking is not enabled for this shipment');
    }

    // Try to get real-time tracking data from ShipsGo
    let trackingData = null;
    let trackingError = null;

    try {
      if (shipment.containerNumber) {
        trackingData = await this.shipsGoTrackingService.trackByContainerNumber(shipment.containerNumber);
      } else if (shipment.blNumber) {
        trackingData = await this.shipsGoTrackingService.trackByBLNumber(shipment.blNumber);
      } else if (shipment.bookingNumber) {
        trackingData = await this.shipsGoTrackingService.trackByBookingNumber(shipment.bookingNumber);
      }
    } catch (error) {
      trackingError = error.message;
    }

    return {
      shipment: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        description: shipment.description,
        status: shipment.status,
        containerNumber: shipment.containerNumber,
        blNumber: shipment.blNumber,
        bookingNumber: shipment.bookingNumber,
        vesselName: shipment.vesselName,
        vesselMMSI: shipment.vesselMMSI,
        shippingLine: shipment.shippingLine,
        voyage: shipment.voyage,
        originPort: shipment.originPort,
        destinationPort: shipment.destinationPort,
        estimatedDeparture: shipment.estimatedDeparture,
        actualDeparture: shipment.actualDeparture,
        estimatedArrival: shipment.estimatedArrival,
        actualArrival: shipment.actualArrival,
      },
      realTimeTracking: trackingData,
      trackingError,
      lastUpdated: new Date(),
    };
  }

  async getCustomerProfile(customerId: string) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    return {
      id: customerAccount.id,
      trackingNumber: customerAccount.trackingNumber,
      customerName: customerAccount.customerName,
      customerEmail: customerAccount.customerEmail,
      customerPhone: customerAccount.customerPhone,
      isActive: customerAccount.isActive,
      lastLogin: customerAccount.lastLogin,
      createdAt: customerAccount.createdAt,
    };
  }

  async changePassword(customerId: string, changePasswordDto: { currentPassword: string; newPassword: string }) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, customerAccount.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update password
    await this.customerAccountRepository.update(customerId, {
      passwordHash: newPasswordHash,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async getCustomerFinancialStats(customerId: string) {
    // Get all shipments for this customer
    const shipments = await this.shipmentRepository.find({
      where: { customerAccountId: customerId },
      relations: ['paymentRecords'],
    });

    // Calculate financial statistics
    let totalPaid = 0;
    let totalPending = 0;
    let totalValue = 0;
    const paymentMethods = {};

    shipments.forEach(shipment => {
      totalValue += Number(shipment.value || 0);
      
      const paidAmount = shipment.paymentRecords.reduce((sum, payment) => sum + Number(payment.amount), 0);
      totalPaid += paidAmount;
      
      const pendingAmount = Number(shipment.value || 0) - paidAmount;
      totalPending += Math.max(0, pendingAmount);

      // Count payment methods
      shipment.paymentRecords.forEach(payment => {
        paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + 1;
      });
    });

    return {
      totalValue,
      totalPaid,
      totalPending,
      paymentMethods,
      totalPayments: shipments.reduce((sum, shipment) => sum + shipment.paymentRecords.length, 0),
    };
  }

  async getCustomerFinancialData(customerId: string, page: number = 1, limit: number = 10) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Get shipments with payment records
    const shipments = await this.shipmentRepository.find({
      where: { customerAccountId: customerId },
      relations: ['paymentRecords'],
      order: { createdAt: 'DESC' },
    });

    // Get financial statistics
    const financialStats = await this.getCustomerFinancialStats(customerId);

    // Get recent payments
    const allPayments = [];
    shipments.forEach(shipment => {
      shipment.paymentRecords.forEach(payment => {
        allPayments.push({
          id: payment.id,
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.method,
          paymentDate: payment.paymentDate,
          referenceNumber: payment.referenceNumber,
          notes: payment.notes,
          recordedBy: payment.recordedBy,
          createdAt: payment.createdAt,
        });
      });
    });

    // Sort payments by date
    allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    // Paginate payments
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = allPayments.slice(startIndex, endIndex);

    return {
      customer: {
        id: customerAccount.id,
        trackingNumber: customerAccount.trackingNumber,
        customerName: customerAccount.customerName,
      },
      financialStats,
      payments: paginatedPayments,
      pagination: {
        page,
        limit,
        total: allPayments.length,
        totalPages: Math.ceil(allPayments.length / limit),
      },
    };
  }

  async getCustomerPaymentHistory(customerId: string, page: number = 1, limit: number = 20) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Get all payments for this customer
    const queryBuilder = this.paymentRecordRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.shipment', 'shipment')
      .where('shipment.customerAccountId = :customerId', { customerId })
      .orderBy('payment.paymentDate', 'DESC');

    const total = await queryBuilder.getCount();
    
    const payments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      customer: {
        id: customerAccount.id,
        trackingNumber: customerAccount.trackingNumber,
        customerName: customerAccount.customerName,
      },
      payments: payments.map(payment => ({
        id: payment.id,
        shipmentId: payment.shipment.id,
        trackingNumber: payment.shipment.trackingNumber,
        amount: Number(payment.amount),
        currency: payment.currency,
        method: payment.method,
        paymentDate: payment.paymentDate,
        referenceNumber: payment.referenceNumber,
        notes: payment.notes,
        recordedBy: payment.recordedBy,
        createdAt: payment.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPublicTracking(trackingNumber: string) {
    // Try to find shipment by tracking number or container number first
    const shipment = await this.shipmentRepository.findOne({
      where: [
        { trackingNumber },
        { containerNumber: trackingNumber }
      ],
    });

    if (shipment) {
      // Return basic shipment information
      return {
        type: 'shipment',
        data: {
          trackingNumber: shipment.trackingNumber,
          containerNumber: shipment.containerNumber,
          description: shipment.description,
          status: shipment.status,
          originPort: shipment.originPort,
          destinationPort: shipment.destinationPort,
          estimatedArrival: shipment.estimatedArrival,
          actualArrival: shipment.actualArrival,
          vesselName: shipment.vesselName,
          shippingLine: shipment.shippingLine,
        },
      };
    }

    // If not found as shipment tracking number, try ShipsGo API
    try {
      let trackingData = null;

      // Try as container number
      if (trackingNumber.match(/^[A-Z]{4}[0-9]{7}$/)) {
        trackingData = await this.shipsGoTrackingService.trackByContainerNumber(trackingNumber);
      } else {
        // Try as BL number
        trackingData = await this.shipsGoTrackingService.trackByBLNumber(trackingNumber);
      }

      return {
        type: 'shipsgo',
        data: trackingData,
      };
    } catch (error) {
      throw new NotFoundException('Tracking number not found');
    }
  }
}
