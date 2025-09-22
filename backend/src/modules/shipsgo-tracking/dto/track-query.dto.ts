import { IsOptional, IsString, Matches, Length } from 'class-validator';

export class TrackQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}[0-9]{7}$/i, { message: 'Invalid container number format' })
  container?: string;

  @IsOptional()
  @IsString()
  @Length(6, 30)
  @Matches(/^[A-Z0-9-]+$/i, { message: 'BL must be alphanumeric with dashes' })
  bl?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[A-Z0-9-]+$/i, { message: 'Booking must be alphanumeric with dashes' })
  booking?: string;
}

