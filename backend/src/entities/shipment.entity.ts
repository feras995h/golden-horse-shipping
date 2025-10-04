import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Client } from './client.entity';
import { PaymentRecord } from './payment-record.entity';
import { CustomerAccount } from './customer-account.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  AT_PORT = 'at_port',
  CUSTOMS_CLEARANCE = 'customs_clearance',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export enum ShipmentType {
  SEA = 'sea',
  AIR = 'air',
  LAND = 'land',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

@Entity('shipments')
export class Shipment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Public tracking number' })
  @Column({ name: 'tracking_number', unique: true })
  trackingNumber: string;

  @ApiProperty({ description: 'Secure token for public tracking access' })
  @Column({ name: 'tracking_token' })
  trackingToken: string;

  @ApiProperty()
  @Column({ name: 'client_id' })
  clientId: string;

  @ApiProperty({ type: () => Client })
  @ManyToOne(() => Client, (client) => client.shipments)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty({ enum: ShipmentType })
  @Column({
    type: 'varchar',
  })
  type: ShipmentType;

  @ApiProperty({ enum: ShipmentStatus })
  @Column({
    type: 'varchar',
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @ApiProperty()
  @Column({ name: 'origin_port' })
  originPort: string;

  @ApiProperty()
  @Column({ name: 'destination_port' })
  destinationPort: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @ApiProperty()
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @ApiProperty({ description: 'Additional charges added by admin', default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalCharges: number;

  @ApiProperty({ description: 'Additional amount marked as paid by admin (outside formal records)', default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adminAmountPaid: number;

  @ApiProperty({ enum: PaymentStatus })
  @Column({
    type: 'varchar',
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @Column({ name: 'estimated_departure', nullable: true })
  estimatedDeparture: Date;

  @ApiProperty()
  @Column({ name: 'actual_departure', nullable: true })
  actualDeparture: Date;

  @ApiProperty()
  @Column({ name: 'estimated_arrival', nullable: true })
  estimatedArrival: Date;

  @ApiProperty()
  @Column({ name: 'actual_arrival', nullable: true })
  actualArrival: Date;

  @ApiProperty()
  @Column({ name: 'vessel_name', nullable: true })
  vesselName: string;

  @ApiProperty()
  @Column({ name: 'vessel_mmsi', nullable: true })
  vesselMMSI: string;

  @ApiProperty()
  @Column({ name: 'vessel_imo', nullable: true })
  vesselIMO: string;

  @ApiProperty()
  @Column({ name: 'container_number', nullable: true })
  containerNumber: string;

  @ApiProperty()
  @Column({ name: 'bl_number', nullable: true })
  blNumber: string;

  @ApiProperty()
  @Column({ name: 'booking_number', nullable: true })
  bookingNumber: string;

  @ApiProperty()
  @Column({ name: 'shipping_line', nullable: true })
  shippingLine: string;

  @ApiProperty()
  @Column({ name: 'voyage', nullable: true })
  voyage: string;

  @ApiProperty()
  @Column({ name: 'enable_tracking', default: false })
  enableTracking: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @ApiProperty({ type: () => [PaymentRecord] })
  @OneToMany(() => PaymentRecord, (payment) => payment.shipment)
  paymentRecords: PaymentRecord[];

  @ApiProperty({ description: 'Customer account ID for portal access' })
  @Column({ name: 'customer_account_id', nullable: true })
  customerAccountId: string;

  @ApiProperty({ type: () => CustomerAccount })
  @ManyToOne(() => CustomerAccount, (customerAccount) => customerAccount.shipments, { nullable: true })
  @JoinColumn({ name: 'customer_account_id' })
  customerAccount: CustomerAccount;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
