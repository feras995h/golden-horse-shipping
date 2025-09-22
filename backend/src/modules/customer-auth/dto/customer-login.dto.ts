import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CustomerLoginDto {
  @ApiProperty({ description: 'Tracking number for customer login' })
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({ description: 'Customer password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class CustomerNumberLoginDto {
  @ApiProperty({ description: 'Customer number for login' })
  @IsString()
  @IsNotEmpty()
  customerNumber: string;

  @ApiProperty({ description: 'Customer password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class CustomerDirectAccessDto {
  @ApiProperty({ description: 'Direct access token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class CreateCustomerAccountDto {
  @ApiProperty({ description: 'Tracking number for customer login' })
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({ description: 'Customer password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty({ description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: 'Customer email address', required: false })
  @IsString()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  notes?: string;
}

export class UpdateCustomerPasswordDto {
  @ApiProperty({ description: 'New password for customer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  newPassword: string;
}

export class CustomerChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  newPassword: string;
}

export class GenerateDirectLinkDto {
  @ApiProperty({ description: 'Number of hours the link should be valid', default: 24 })
  validHours?: number = 24;
}
