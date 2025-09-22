import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('settings')
export class Setting {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  key: string;

  @ApiProperty()
  @Column('text')
  value: string;

  @ApiProperty()
  @Column({ default: 'string' })
  type: string; // 'string', 'number', 'boolean', 'json'

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
