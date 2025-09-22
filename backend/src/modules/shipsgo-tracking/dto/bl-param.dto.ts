import { IsString, Matches, Length } from 'class-validator';

export class BLParamDto {
  @IsString()
  @Length(6, 30)
  @Matches(/^[A-Z0-9-]+$/i, { message: 'BL must be alphanumeric with dashes' })
  blNumber!: string;
}

