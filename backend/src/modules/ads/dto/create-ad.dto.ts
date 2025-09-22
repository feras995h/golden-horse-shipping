import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdDto {
  @ApiProperty({ description: 'Ad title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Ad description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Link URL', required: false })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiProperty({ description: 'Tags (comma-separated)', required: false })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Display order', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number = 0;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Ad image file', required: false })
  image?: any;
}
