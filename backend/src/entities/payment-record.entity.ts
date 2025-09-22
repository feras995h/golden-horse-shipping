import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Shipment } from './shipment.entity';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  CHECK = 'check',
  OTHER = 'other',
}

@Entity('payment_records')
export class PaymentRecord {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ApiProperty({ type: () => Shipment })
  @ManyToOne(() => Shipment, (shipment) => shipment.paymentRecords)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ enum: PaymentMethod })
  @Column({
    type: 'varchar',
  })
  method: PaymentMethod;

  @ApiProperty()
  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @ApiProperty()
  @Column({ name: 'payment_date' })
  paymentDate: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ name: 'recorded_by' })
  recordedBy: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
