import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AdStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('ads')
export class Ad {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty()
  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @ApiProperty()
  @Column({ name: 'link_url', nullable: true })
  linkUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  tags: string;

  @ApiProperty({ enum: AdStatus })
  @Column({
    type: 'varchar',
    default: AdStatus.ACTIVE,
  })
  status: AdStatus;

  @ApiProperty()
  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @ApiProperty()
  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @ApiProperty()
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty()
  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @ApiProperty()
  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @ApiProperty()
  @Column({ name: 'created_by' })
  createdBy: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
