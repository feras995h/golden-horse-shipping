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

@Entity('clients')
@Index(['clientId'], { unique: true })
@Index(['trackingNumber'], { unique: true })
export class Client {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique client tracking ID for public access' })
  @Column({ name: 'client_id', unique: true })
  clientId: string;

  @ApiProperty({ description: 'Tracking number for customer portal access' })
  @Column({ name: 'tracking_number', unique: true, nullable: true })
  trackingNumber: string;

  @ApiProperty({ description: 'Customer password for portal access' })
  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @ApiProperty()
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ nullable: true })
  company: string;

  @ApiProperty()
  @Column({ name: 'address_line_1' })
  addressLine1: string;

  @ApiProperty()
  @Column({ name: 'address_line_2', nullable: true })
  addressLine2: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column()
  country: string;

  @ApiProperty()
  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'Direct access token for admin-generated links' })
  @Column({ name: 'direct_access_token', nullable: true })
  directAccessToken: string;

  @ApiProperty({ description: 'Token expiry date for direct access' })
  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @ApiProperty({ description: 'Whether the client has portal access' })
  @Column({ name: 'has_portal_access', default: false })
  hasPortalAccess: boolean;

  @ApiProperty({ type: () => [Shipment] })
  @OneToMany(() => Shipment, (shipment) => shipment.client)
  shipments: Shipment[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
