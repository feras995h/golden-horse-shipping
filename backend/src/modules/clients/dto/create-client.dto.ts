import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Client full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Client email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Client phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Whether the client is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Portal access fields
  @ApiProperty({ description: 'Enable portal access for this client', default: false })
  @IsBoolean()
  @IsOptional()
  hasPortalAccess?: boolean;

  @ApiProperty({ description: 'Tracking number for portal access', required: false })
  @IsString()
  @IsOptional()
  @MinLength(5)
  trackingNumber?: string;

  @ApiProperty({ description: 'Password for portal access', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
