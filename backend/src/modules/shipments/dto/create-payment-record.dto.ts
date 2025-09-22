import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../entities/payment-record.entity';

export class CreatePaymentRecordDto {
  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment reference number', required: false })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiProperty({ description: 'Payment date' })
  @IsDateString()
  paymentDate: Date;

  @ApiProperty({ description: 'Payment notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
