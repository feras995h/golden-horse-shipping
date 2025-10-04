import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShipmentType } from '../../../entities/shipment.entity';

export class UpdateShipmentDto {
  @ApiProperty({ description: 'Client ID', required: false })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'Shipment description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ShipmentType, description: 'Shipment type', required: false })
  @IsEnum(ShipmentType)
  @IsOptional()
  type?: ShipmentType;

  @ApiProperty({ description: 'Origin port', required: false })
  @IsString()
  @IsOptional()
  originPort?: string;

  @ApiProperty({ description: 'Destination port', required: false })
  @IsString()
  @IsOptional()
  destinationPort?: string;

  @ApiProperty({ description: 'Weight in kg', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Volume in cubic meters', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volume?: number;

  @ApiProperty({ description: 'Cargo value', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiProperty({ description: 'Currency code', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Total shipping cost', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCost?: number;

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

  @ApiProperty({ description: 'Enable real-time tracking', required: false })
  @IsOptional()
  enableTracking?: boolean;

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
