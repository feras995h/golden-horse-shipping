import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Shipment } from './shipment.entity';

@Entity('customer_accounts')
@Index(['trackingNumber'], { unique: true })
@Index(['customerNumber'], { unique: true })
export class CustomerAccount {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tracking number used for customer login' })
  @Column({ name: 'tracking_number', unique: true })
  trackingNumber: string;

  @ApiProperty({ description: 'Customer number for login (alternative to tracking number)' })
  @Column({ name: 'customer_number', unique: true, nullable: true })
  customerNumber: string;

  @ApiProperty({ description: 'Customer password for portal access' })
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @ApiProperty({ description: 'Customer full name' })
  @Column({ name: 'customer_name' })
  customerName: string;

  @ApiProperty({ description: 'Customer email address' })
  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @ApiProperty({ description: 'Customer phone number' })
  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @ApiProperty({ description: 'Whether the account is active' })
  @Column({ 
    name: 'is_active', 
    type: 'integer',
    default: 1,
    transformer: {
      to: (value: boolean) => value ? 1 : 0,
      from: (value: number) => Boolean(value)
    }
  })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the customer has portal access' })
  @Column({ 
    name: 'has_portal_access', 
    type: 'integer',
    default: 1,
    transformer: {
      to: (value: boolean) => value ? 1 : 0,
      from: (value: number) => Boolean(value)
    }
  })
  hasPortalAccess: boolean;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'Direct access token for admin-generated links' })
  @Column({ name: 'direct_access_token', nullable: true })
  directAccessToken: string;

  @ApiProperty({ description: 'Token expiry date for direct access' })
  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @ApiProperty({ description: 'Additional notes for the customer account' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ type: () => [Shipment] })
  @OneToMany(() => Shipment, (shipment) => shipment.customerAccount, { nullable: true })
  shipments: Shipment[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
