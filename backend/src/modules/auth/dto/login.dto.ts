import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
