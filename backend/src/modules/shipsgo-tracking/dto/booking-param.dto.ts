import { IsString, Matches, Length } from 'class-validator';

export class BookingParamDto {
  @IsString()
  @Length(3, 30)
  @Matches(/^[A-Z0-9-]+$/i, { message: 'Booking must be alphanumeric with dashes' })
  bookingNumber!: string;
}

