import { IsString, Matches } from 'class-validator';

export class ContainerParamDto {
  @IsString()
  @Matches(/^[A-Z]{4}[0-9]{7}$/i, {
    message: 'Invalid container number format. Expected ABCD1234567',
  })
  containerNumber!: string;
}

