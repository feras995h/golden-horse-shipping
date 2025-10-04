import { IsString, IsEmail, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiProperty({ description: 'Client full name', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'Client email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Client phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: 'Address line 1', required: false })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Whether the client is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Enable portal access for this client', required: false })
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
