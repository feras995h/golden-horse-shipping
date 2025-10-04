import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShipmentType } from '../../../entities/shipment.entity';

export class CreateShipmentDto {
  @ApiProperty({ description: 'Client ID' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Shipment description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ShipmentType, description: 'Shipment type' })
  @IsEnum(ShipmentType)
  type: ShipmentType;

  @ApiProperty({ description: 'Origin port' })
  @IsString()
  @IsNotEmpty()
  originPort: string;

  @ApiProperty({ description: 'Destination port' })
  @IsString()
  @IsNotEmpty()
  destinationPort: string;

  @ApiProperty({ description: 'Weight in kg' })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ description: 'Volume in cubic meters', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volume?: number;

  @ApiProperty({ description: 'Cargo value' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Total shipping cost' })
  @IsNumber()
  @Min(0)
  totalCost: number;

  @ApiProperty({ description: 'Additional charges added by admin', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  additionalCharges?: number = 0;

  @ApiProperty({ description: 'Amount paid recorded by admin outside payment records', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  adminAmountPaid?: number = 0;

  @ApiProperty({ description: 'Estimated departure date', required: false })
  @IsDateString()
  @IsOptional()
  estimatedDeparture?: Date;

  @ApiProperty({ description: 'Estimated arrival date', required: false })
  @IsDateString()
  @IsOptional()
  estimatedArrival?: Date;

  @ApiProperty({ description: 'Vessel name', required: false })
  @IsString()
  @IsOptional()
  vesselName?: string;

  @ApiProperty({ description: 'Vessel MMSI number', required: false })
  @IsString()
  @IsOptional()
  vesselMMSI?: string;

  @ApiProperty({ description: 'Vessel IMO number', required: false })
  @IsString()
  @IsOptional()
  vesselIMO?: string;

  @ApiProperty({ description: 'Container number', required: false })
  @IsString()
  @IsOptional()
  containerNumber?: string;

  @ApiProperty({ description: 'Bill of Lading (BL) number', required: false })
  @IsString()
  @IsOptional()
  blNumber?: string;

  @ApiProperty({ description: 'Booking number', required: false })
  @IsString()
  @IsOptional()
  bookingNumber?: string;

  @ApiProperty({ description: 'Shipping line', required: false })
  @IsString()
  @IsOptional()
  shippingLine?: string;

  @ApiProperty({ description: 'Voyage number', required: false })
  @IsString()
  @IsOptional()
  voyage?: string;

  @ApiProperty({ description: 'Enable real-time tracking', default: false })
  @IsOptional()
  enableTracking?: boolean = false;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Special instructions', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiProperty({ description: 'Customer account ID for portal access', required: false })
  @IsString()
  @IsOptional()
  customerAccountId?: string;
}
