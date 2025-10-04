import { PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Username', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Password', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ enum: UserRole, description: 'User role', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'Is user active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
