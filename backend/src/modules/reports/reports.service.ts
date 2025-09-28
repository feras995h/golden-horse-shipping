import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';
import { format } from 'date-fns';

import { Shipment, ShipmentStatus, PaymentStatus } from '../../entities/shipment.entity';
import { Client } from '../../entities/client.entity';
import { PaymentRecord } from '../../entities/payment-record.entity';
import { Ad, AdStatus } from '../../entities/ad.entity';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: ShipmentStatus;
  paymentStatus?: PaymentStatus;
  clientId?: string;
}

export interface ShipmentReportData {
  trackingNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  type: string;
  status: string;
  originPort: string;
  destinationPort: string;
  weight: number;
  totalCost: number;
  paymentStatus: string;
  createdAt: Date;
  estimatedDeparture?: Date;
  actualDeparture?: Date;
  estimatedArrival?: Date;
  actualArrival?: Date;
}

export interface PaymentReportData {
  trackingNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  method: string;
  paymentDate: Date;
  referenceNumber?: string;
  recordedBy: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    @InjectRepository(Ad)
    private adRepository: Repository<Ad>,
  ) {}

  async getShipmentsReport(filters: ReportFilters): Promise<ShipmentReportData[]> {
    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.client', 'client');

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('shipment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('shipment.status = :status', { status: filters.status });
    }

    if (filters.paymentStatus) {
      queryBuilder.andWhere('shipment.paymentStatus = :paymentStatus', {
        paymentStatus: filters.paymentStatus,
      });
    }

    if (filters.clientId) {
      queryBuilder.andWhere('shipment.clientId = :clientId', { clientId: filters.clientId });
    }

    queryBuilder.orderBy('shipment.createdAt', 'DESC');

    const shipments = await queryBuilder.getMany();

    return shipments.map((shipment) => ({
      trackingNumber: shipment.trackingNumber,
      clientName: shipment.client.fullName,
      clientEmail: shipment.client.email,
      description: shipment.description,
      type: shipment.type,
      status: shipment.status,
      originPort: shipment.originPort,
      destinationPort: shipment.destinationPort,
      weight: Number(shipment.weight),
      totalCost: Number(shipment.totalCost),
      paymentStatus: shipment.paymentStatus,
      createdAt: shipment.createdAt,
      estimatedDeparture: shipment.estimatedDeparture,
      actualDeparture: shipment.actualDeparture,
      estimatedArrival: shipment.estimatedArrival,
      actualArrival: shipment.actualArrival,
    }));
  }

  async getPaymentsReport(filters: ReportFilters): Promise<PaymentReportData[]> {
    const queryBuilder = this.paymentRecordRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.shipment', 'shipment')
      .leftJoinAndSelect('shipment.client', 'client');

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.clientId) {
      queryBuilder.andWhere('shipment.clientId = :clientId', { clientId: filters.clientId });
    }

    queryBuilder.orderBy('payment.paymentDate', 'DESC');

    const payments = await queryBuilder.getMany();

    return payments.map((payment) => ({
      trackingNumber: payment.shipment.trackingNumber,
      clientName: payment.shipment.client.fullName,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      paymentDate: payment.paymentDate,
      referenceNumber: payment.referenceNumber,
      recordedBy: payment.recordedBy,
    }));
  }

  async exportShipmentsToCSV(filters: ReportFilters): Promise<string> {
    const data = await this.getShipmentsReport(filters);
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `shipments-report-${timestamp}.csv`;
    const filepath = join(process.cwd(), 'uploads', 'reports', filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'trackingNumber', title: 'Tracking Number' },
        { id: 'clientName', title: 'Client Name' },
        { id: 'clientEmail', title: 'Client Email' },
        { id: 'description', title: 'Description' },
        { id: 'type', title: 'Type' },
        { id: 'status', title: 'Status' },
        { id: 'originPort', title: 'Origin Port' },
        { id: 'destinationPort', title: 'Destination Port' },
        { id: 'weight', title: 'Weight (kg)' },
        { id: 'totalCost', title: 'Total Cost' },
        { id: 'paymentStatus', title: 'Payment Status' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'estimatedDeparture', title: 'Estimated Departure' },
        { id: 'actualDeparture', title: 'Actual Departure' },
        { id: 'estimatedArrival', title: 'Estimated Arrival' },
        { id: 'actualArrival', title: 'Actual Arrival' },
      ],
    });

    await csvWriter.writeRecords(data);
    return `/uploads/reports/${filename}`;
  }

  async exportPaymentsToCSV(filters: ReportFilters): Promise<string> {
    const data = await this.getPaymentsReport(filters);
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `payments-report-${timestamp}.csv`;
    const filepath = join(process.cwd(), 'uploads', 'reports', filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'trackingNumber', title: 'Tracking Number' },
        { id: 'clientName', title: 'Client Name' },
        { id: 'amount', title: 'Amount' },
        { id: 'currency', title: 'Currency' },
        { id: 'method', title: 'Payment Method' },
        { id: 'paymentDate', title: 'Payment Date' },
        { id: 'referenceNumber', title: 'Reference Number' },
        { id: 'recordedBy', title: 'Recorded By' },
      ],
    });

    await csvWriter.writeRecords(data);
    return `/uploads/reports/${filename}`;
  }

  async getDashboardStats(): Promise<{
    totalClients: number;
    activeClients: number;
    totalShipments: number;
    shipmentsInTransit: number;
    activeShipments: number;
    deliveredShipments: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    delayedShipments: number;
    activeAds: number;
    totalAdViews: number;
    totalAdClicks: number;
    topClients: Array<{ name: string; shipmentCount: number; totalValue: number }>;
    shipmentsByStatus: Array<{ status: string; count: number }>;
    monthlyShipments: Array<{ month: string; count: number }>;
  }> {
    // Client stats
    const totalClients = await this.clientRepository.count();
    const activeClients = await this.clientRepository.count({
      where: { isActive: true },
    });

    // Shipment stats
    const totalShipments = await this.shipmentRepository.count();

    const shipmentsInTransit = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.IN_TRANSIT },
    });

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

    // Payment stats
    const pendingPayments = await this.shipmentRepository.count({
      where: [
        { paymentStatus: PaymentStatus.UNPAID },
        { paymentStatus: PaymentStatus.PARTIAL },
      ],
    });

    // Delayed shipments count
    const delayedShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELAYED },
    });

    // Ad stats
    const activeAds = await this.adRepository.count({
      where: { status: AdStatus.ACTIVE },
    });

    const allAds = await this.adRepository.find();
    const totalAdViews = allAds.reduce((sum, ad) => sum + (ad.viewCount || 0), 0);
    const totalAdClicks = allAds.reduce((sum, ad) => sum + (ad.clickCount || 0), 0);

    // Calculate total revenue from paid shipments
    const paidShipments = await this.shipmentRepository.find({
      where: { paymentStatus: PaymentStatus.PAID },
    });
    const totalRevenue = paidShipments.reduce((sum, shipment) => sum + Number(shipment.totalCost), 0);

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyPaidShipments = await this.shipmentRepository.find({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: Between(startOfMonth, new Date()),
      },
    });
    const monthlyRevenue = monthlyPaidShipments.reduce((sum, shipment) => sum + Number(shipment.totalCost), 0);

    // Get top clients
    const topClientsQuery = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('client.fullName', 'name')
      .addSelect('COUNT(shipment.id)', 'shipmentCount')
      .addSelect('SUM(shipment.totalCost)', 'totalValue')
      .leftJoin('shipment.client', 'client')
      .groupBy('client.id, client.fullName')
      .orderBy('COUNT(shipment.id)', 'DESC')
      .limit(5)
      .getRawMany();

    const topClients = topClientsQuery.map(client => ({
      name: client.name,
      shipmentCount: parseInt(client.shipmentCount),
      totalValue: parseFloat(client.totalValue) || 0,
    }));

    // Get shipments by status
    const shipmentsByStatusQuery = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('shipment.status', 'status')
      .addSelect('COUNT(shipment.id)', 'count')
      .groupBy('shipment.status')
      .getRawMany();

    const shipmentsByStatus = shipmentsByStatusQuery.map(item => ({
      status: item.status,
      count: parseInt(item.count),
    }));

    // Get monthly shipments for the last 6 months
    const monthlyShipmentsQuery = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select("to_char(shipment.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(shipment.id)', 'count')
      .where('shipment.createdAt >= :sixMonthsAgo', {
        sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      })
      .groupBy("to_char(shipment.createdAt, 'YYYY-MM')")
      .orderBy("to_char(shipment.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const monthlyShipments = monthlyShipmentsQuery.map(item => ({
      month: item.month,
      count: parseInt(item.count),
    }));

    return {
      totalClients,
      activeClients,
      totalShipments,
      shipmentsInTransit,
      activeShipments,
      deliveredShipments,
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      delayedShipments,
      activeAds,
      totalAdViews,
      totalAdClicks,
      topClients,
      shipmentsByStatus,
      monthlyShipments,
    };
  }

  async getAdvancedStats(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Basic counts
    const totalShipments = await this.shipmentRepository.count();
    const totalClients = await this.clientRepository.count();
    const activeShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.IN_TRANSIT }
    });

    // Revenue calculations
    const allShipments = await this.shipmentRepository.find();
    const totalRevenue = allShipments.reduce((sum, shipment) => sum + (shipment.totalCost || 0), 0);
    const monthlyShipments = await this.shipmentRepository.find({
      where: { createdAt: Between(startOfMonth, now) }
    });
    const monthlyRevenue = monthlyShipments.reduce((sum, shipment) => sum + (shipment.totalCost || 0), 0);

    // Performance metrics
    const deliveredShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELIVERED }
    });
    const delayedShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELAYED }
    });
    const processingShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.PROCESSING }
    });
    const inTransitShipments = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.IN_TRANSIT }
    });

    const deliverySuccessRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;
    const onTimeDeliveryRate = deliveredShipments > 0 ? ((deliveredShipments - delayedShipments) / deliveredShipments) * 100 : 0;

    // Mock data for advanced analytics (in a real app, these would be calculated from actual data)
    const topRoutes = [
      { route: 'طرابلس - بنغازي', count: 45, revenue: 125000 },
      { route: 'مصراتة - سبها', count: 32, revenue: 89000 },
      { route: 'الزاوية - طبرق', count: 28, revenue: 76000 }
    ];

    const shipmentsByStatus = [
      { status: 'مكتملة', count: deliveredShipments, percentage: (deliveredShipments / totalShipments) * 100 },
      { status: 'قيد النقل', count: inTransitShipments, percentage: (inTransitShipments / totalShipments) * 100 },
      { status: 'قيد المعالجة', count: processingShipments, percentage: (processingShipments / totalShipments) * 100 },
      { status: 'متأخرة', count: delayedShipments, percentage: (delayedShipments / totalShipments) * 100 }
    ];

    const monthlyTrends = [
      { month: 'يناير', shipments: 120, revenue: 340000 },
      { month: 'فبراير', shipments: 135, revenue: 385000 },
      { month: 'مارس', shipments: 148, revenue: 420000 },
      { month: 'أبريل', shipments: 162, revenue: 465000 },
      { month: 'مايو', shipments: 178, revenue: 510000 },
      { month: 'يونيو', shipments: 195, revenue: 560000 }
    ];

    return {
      totalShipments,
      totalClients,
      activeShipments,
      totalRevenue,
      monthlyRevenue,
      averageShipmentValue: totalShipments > 0 ? totalRevenue / totalShipments : 0,
      deliverySuccessRate,
      customerSatisfactionRate: 92.5,
      topRoutes,
      shipmentsByStatus,
      monthlyTrends,
      paymentMethods: [
        { method: 'نقدي', count: 85, amount: 245000 },
        { method: 'تحويل بنكي', count: 65, amount: 189000 },
        { method: 'بطاقة ائتمان', count: 45, amount: 126000 }
      ],
      delayedShipments,
      onTimeDeliveries: deliveredShipments - delayedShipments,
      onTimeDeliveryRate,
      averageDeliveryTime: 5.2,
      processingShipments,
      inTransitShipments,
      deliveredShipments,
      cityDistribution: [
        { city: 'طرابلس', count: 89, percentage: 35.6 },
        { city: 'بنغازي', count: 67, percentage: 26.8 },
        { city: 'مصراتة', count: 45, percentage: 18.0 },
        { city: 'سبها', count: 32, percentage: 12.8 },
        { city: 'أخرى', count: 17, percentage: 6.8 }
      ],
      monthlyGrowth: [
        { month: 'يناير', growth: 12, percentage: 8.5 },
        { month: 'فبراير', growth: 15, percentage: 12.5 },
        { month: 'مارس', growth: 13, percentage: 9.6 },
        { month: 'أبريل', growth: 14, percentage: 9.5 },
        { month: 'مايو', growth: 16, percentage: 9.9 },
        { month: 'يونيو', growth: 17, percentage: 9.5 }
      ],
      dailyPerformance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shipments: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000) + 10000
      })),
      shipmentTypes: [
        { type: 'عادي', count: 145, percentage: 58.0 },
        { type: 'سريع', count: 78, percentage: 31.2 },
        { type: 'عاجل', count: 27, percentage: 10.8 }
      ],
      priorityLevels: [
        { priority: 'عالي', count: 45, percentage: 18.0 },
        { priority: 'متوسط', count: 125, percentage: 50.0 },
        { priority: 'منخفض', count: 80, percentage: 32.0 }
      ],
      newCustomers: 28,
      activeCustomers: totalClients * 0.75,
      totalCustomers: totalClients,
      customerGrowth: 15.2,
      retentionRate: 87.3,
      successRate: deliverySuccessRate,
      averageProcessingTime: 2.4,
      customerSatisfaction: 4.3,
      revenueGrowth: 18.5,
      netProfit: totalRevenue * 0.25,
      profitMargin: 25.0,
      averageOrderValue: totalShipments > 0 ? totalRevenue / totalShipments : 0
    };
  }

  async getDelayedShipments(): Promise<Shipment[]> {
    const now = new Date();
    
    return this.shipmentRepository.find({
      where: [
        {
          status: ShipmentStatus.DELAYED,
        },
        {
          estimatedArrival: Between(new Date(0), now),
          status: ShipmentStatus.IN_TRANSIT,
        },
      ],
      relations: ['client'],
      order: { estimatedArrival: 'ASC' },
    });
  }

  async getUnpaidShipments(): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: [
        { paymentStatus: PaymentStatus.UNPAID },
        { paymentStatus: PaymentStatus.PARTIAL },
      ],
      relations: ['client', 'paymentRecords'],
      order: { createdAt: 'DESC' },
    });
  }
}
