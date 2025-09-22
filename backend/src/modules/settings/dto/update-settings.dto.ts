import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Site name', required: false })
  @IsOptional()
  @IsString()
  siteName?: string;

  @ApiProperty({ description: 'Site description', required: false })
  @IsOptional()
  @IsString()
  siteDescription?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'Support email', required: false })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Company address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Default currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Default language', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Default timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Enable email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Enable SMS notifications', required: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ description: 'Enable system notifications', required: false })
  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;

  @ApiProperty({ description: 'Maintenance mode', required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiProperty({ description: 'Enable user registration', required: false })
  @IsOptional()
  @IsBoolean()
  registrationEnabled?: boolean;

  @ApiProperty({ description: 'Enable automatic backups', required: false })
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @ApiProperty({ description: 'Backup frequency', required: false })
  @IsOptional()
  @IsString()
  backupFrequency?: string;
}
