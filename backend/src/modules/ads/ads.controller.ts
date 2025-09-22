import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';

import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdStatus } from '../../entities/ad.entity';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new ad' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Ad created successfully' })
  create(
    @Body() createAdDto: CreateAdDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.adsService.create(createAdDto, req.user.username, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ads (public access)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: AdStatus })
  @ApiQuery({ name: 'tags', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AdStatus,
    @Query('tags') tags?: string,
  ) {
    return this.adsService.findAll(page, limit, status, tags);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active ads (public access)' })
  @ApiResponse({ status: 200, description: 'Active ads retrieved successfully' })
  findActiveAds() {
    return this.adsService.findActiveAds();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ad statistics' })
  getStats() {
    return this.adsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ad by ID' })
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment ad view count (public access)' })
  incrementViewCount(@Param('id') id: string) {
    return this.adsService.incrementViewCount(id);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Increment ad click count (public access)' })
  incrementClickCount(@Param('id') id: string) {
    return this.adsService.incrementClickCount(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update ad' })
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateAdDto: UpdateAdDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adsService.update(id, updateAdDto, file);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ad status' })
  updateStatus(@Param('id') id: string, @Body('status') status: AdStatus) {
    return this.adsService.updateStatus(id, status);
  }

  @Patch(':id/display-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ad display order' })
  updateDisplayOrder(@Param('id') id: string, @Body('displayOrder') displayOrder: number) {
    return this.adsService.updateDisplayOrder(id, displayOrder);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ad' })
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
