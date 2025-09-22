import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';

import { Ad, AdStatus } from '../../entities/ad.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private adRepository: Repository<Ad>,
  ) {}

  async create(createAdDto: CreateAdDto, createdBy: string, imageFile?: Express.Multer.File): Promise<Ad> {
    const ad = this.adRepository.create({
      ...createAdDto,
      createdBy,
      imageUrl: imageFile ? `/uploads/ads/${imageFile.filename}` : null,
    });

    return this.adRepository.save(ad);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: AdStatus,
    tags?: string,
  ): Promise<{
    ads: Ad[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.adRepository.createQueryBuilder('ad');

    if (status) {
      queryBuilder.andWhere('ad.status = :status', { status });
    }

    if (tags) {
      queryBuilder.andWhere('ad.tags ILIKE :tags', { tags: `%${tags}%` });
    }

    queryBuilder
      .orderBy('ad.displayOrder', 'ASC')
      .addOrderBy('ad.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const [ads, total] = await queryBuilder.getManyAndCount();

    return {
      ads,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findActiveAds(): Promise<Ad[]> {
    const now = new Date();
    
    return this.adRepository.find({
      where: [
        {
          status: AdStatus.ACTIVE,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
        {
          status: AdStatus.ACTIVE,
          startDate: null,
          endDate: null,
        },
        {
          status: AdStatus.ACTIVE,
          startDate: LessThanOrEqual(now),
          endDate: null,
        },
        {
          status: AdStatus.ACTIVE,
          startDate: null,
          endDate: MoreThanOrEqual(now),
        },
      ],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Ad> {
    const ad = await this.adRepository.findOne({ where: { id } });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  async update(id: string, updateAdDto: UpdateAdDto, imageFile?: Express.Multer.File): Promise<Ad> {
    const ad = await this.findOne(id);

    // If new image is uploaded, delete old one
    if (imageFile && ad.imageUrl) {
      try {
        await unlink(join(process.cwd(), ad.imageUrl));
      } catch (error) {
        // Ignore error if file doesn't exist
      }
    }

    const updateData = {
      ...updateAdDto,
      imageUrl: imageFile ? `/uploads/ads/${imageFile.filename}` : ad.imageUrl,
    };

    await this.adRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const ad = await this.findOne(id);

    // Delete associated image file
    if (ad.imageUrl) {
      try {
        await unlink(join(process.cwd(), ad.imageUrl));
      } catch (error) {
        // Ignore error if file doesn't exist
      }
    }

    await this.adRepository.remove(ad);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.adRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.adRepository.increment({ id }, 'clickCount', 1);
  }

  async updateStatus(id: string, status: AdStatus): Promise<Ad> {
    await this.adRepository.update(id, { status });
    return this.findOne(id);
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<Ad> {
    await this.adRepository.update(id, { displayOrder });
    return this.findOne(id);
  }

  async getStats(): Promise<{
    totalAds: number;
    activeAds: number;
    inactiveAds: number;
    expiredAds: number;
    totalViews: number;
    totalClicks: number;
  }> {
    const totalAds = await this.adRepository.count();
    const activeAds = await this.adRepository.count({
      where: { status: AdStatus.ACTIVE },
    });
    const inactiveAds = await this.adRepository.count({
      where: { status: AdStatus.INACTIVE },
    });
    const expiredAds = await this.adRepository.count({
      where: { status: AdStatus.EXPIRED },
    });

    const viewsResult = await this.adRepository
      .createQueryBuilder('ad')
      .select('SUM(ad.viewCount)', 'totalViews')
      .getRawOne();

    const clicksResult = await this.adRepository
      .createQueryBuilder('ad')
      .select('SUM(ad.clickCount)', 'totalClicks')
      .getRawOne();

    return {
      totalAds,
      activeAds,
      inactiveAds,
      expiredAds,
      totalViews: parseInt(viewsResult.totalViews) || 0,
      totalClicks: parseInt(clicksResult.totalClicks) || 0,
    };
  }

  async checkAndUpdateExpiredAds(): Promise<void> {
    const now = new Date();
    
    await this.adRepository.update(
      {
        status: AdStatus.ACTIVE,
        endDate: LessThanOrEqual(now),
      },
      { status: AdStatus.EXPIRED },
    );
  }
}
