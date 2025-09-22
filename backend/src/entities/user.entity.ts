import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  username: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty()
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ enum: UserRole })
  @Column({
    type: 'varchar',
    default: UserRole.OPERATOR,
  })
  role: UserRole;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
