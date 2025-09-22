import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.OPERATOR;

  @ApiProperty({ description: 'Is user active', default: true })
  @IsOptional()
  isActive?: boolean = true;
}
