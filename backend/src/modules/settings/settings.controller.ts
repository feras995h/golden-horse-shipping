import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';

import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public settings (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public settings retrieved successfully' })
  findPublic() {
    return this.settingsService.findPublic();
  }

  @Patch()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update system settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  update(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.update(updateSettingsDto);
  }

  @Post('backup')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create system backup (Admin only)' })
  @ApiResponse({ status: 200, description: 'Backup created successfully' })
  createBackup() {
    return this.settingsService.createBackup();
  }

  @Get('backup/list')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'List available backups (Admin only)' })
  @ApiResponse({ status: 200, description: 'Backup list retrieved successfully' })
  listBackups() {
    return this.settingsService.listBackups();
  }

  @Post('backup/:filename/restore')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Restore from backup (Admin only)' })
  @ApiResponse({ status: 200, description: 'Backup restored successfully' })
  restoreBackup(@Body('filename') filename: string) {
    return this.settingsService.restoreBackup(filename);
  }

  @Get('system-info')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get system information (Admin only)' })
  @ApiResponse({ status: 200, description: 'System info retrieved successfully' })
  getSystemInfo() {
    return this.settingsService.getSystemInfo();
  }

  @Post('upload-logo')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload logo and favicon (Admin only)' })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  uploadLogo(
    @UploadedFiles() files: { logo?: Express.Multer.File[], favicon?: Express.Multer.File[] },
    @Body() body: { logoAlt?: string }
  ) {
    return this.settingsService.uploadLogo(files, body);
  }
}
