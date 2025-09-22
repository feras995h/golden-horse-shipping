import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Setting } from '../../entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {
    this.initializeDefaultSettings();
  }

  async findAll() {
    const settings = await this.settingRepository.find();
    const settingsMap = {};
    
    settings.forEach(setting => {
      settingsMap[setting.key] = {
        value: this.parseValue(setting.value, setting.type),
        type: setting.type,
        description: setting.description,
        isPublic: setting.isPublic,
      };
    });

    return settingsMap;
  }

  async findPublic() {
    const settings = await this.settingRepository.find({ where: { isPublic: true } });
    const settingsMap = {};
    
    settings.forEach(setting => {
      settingsMap[setting.key] = this.parseValue(setting.value, setting.type);
    });

    return settingsMap;
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const updates = [];

    for (const [key, value] of Object.entries(updateSettingsDto)) {
      const setting = await this.settingRepository.findOne({ where: { key } });
      
      if (setting) {
        setting.value = this.stringifyValue(value, setting.type);
        updates.push(this.settingRepository.save(setting));
      }
    }

    await Promise.all(updates);
    return this.findAll();
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      
      // Get all data for backup
      const settings = await this.settingRepository.find();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        settings,
      };

      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      
      this.logger.log(`Backup created: ${backupFile}`);
      
      return {
        success: true,
        filename: `backup-${timestamp}.json`,
        timestamp,
      };
    } catch (error) {
      this.logger.error('Failed to create backup', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        return { backups: [] };
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json') && file.startsWith('backup-'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return { backups: files };
    } catch (error) {
      this.logger.error('Failed to list backups', error);
      return { backups: [] };
    }
  }

  async restoreBackup(filename: string) {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      const backupFile = path.join(backupDir, filename);
      
      if (!fs.existsSync(backupFile)) {
        throw new Error('Backup file not found');
      }

      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      // Restore settings
      if (backupData.settings) {
        await this.settingRepository.clear();
        await this.settingRepository.save(backupData.settings);
      }

      this.logger.log(`Backup restored: ${filename}`);
      
      return {
        success: true,
        message: 'Backup restored successfully',
        timestamp: backupData.timestamp,
      };
    } catch (error) {
      this.logger.error('Failed to restore backup', error);
      throw error;
    }
  }

  async getSystemInfo() {
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      nodeVersion,
      platform,
      arch,
      uptime,
      memoryUsage,
      timestamp: new Date().toISOString(),
    };
  }

  private async initializeDefaultSettings() {
    const defaultSettings = [
      { key: 'siteName', value: 'شركة الحصان الذهبي للشحن', type: 'string', description: 'Site name', isPublic: true },
      { key: 'siteDescription', value: 'خدمات الشحن والنقل البحري', type: 'string', description: 'Site description', isPublic: true },
      { key: 'contactEmail', value: 'info@goldenhorse.com', type: 'string', description: 'Contact email', isPublic: true },
      { key: 'supportEmail', value: 'support@goldenhorse.com', type: 'string', description: 'Support email', isPublic: true },
      { key: 'phoneNumber', value: '+966123456789', type: 'string', description: 'Phone number', isPublic: true },
      { key: 'address', value: 'الرياض، المملكة العربية السعودية', type: 'string', description: 'Company address', isPublic: true },
      { key: 'currency', value: 'SAR', type: 'string', description: 'Default currency', isPublic: false },
      { key: 'language', value: 'ar', type: 'string', description: 'Default language', isPublic: false },
      { key: 'timezone', value: 'Asia/Riyadh', type: 'string', description: 'Default timezone', isPublic: false },
      { key: 'emailNotifications', value: 'true', type: 'boolean', description: 'Enable email notifications', isPublic: false },
      { key: 'smsNotifications', value: 'false', type: 'boolean', description: 'Enable SMS notifications', isPublic: false },
      { key: 'systemNotifications', value: 'true', type: 'boolean', description: 'Enable system notifications', isPublic: false },
      { key: 'maintenanceMode', value: 'false', type: 'boolean', description: 'Maintenance mode', isPublic: false },
      { key: 'registrationEnabled', value: 'true', type: 'boolean', description: 'Enable user registration', isPublic: false },
      { key: 'autoBackup', value: 'true', type: 'boolean', description: 'Enable automatic backups', isPublic: false },
      { key: 'backupFrequency', value: 'daily', type: 'string', description: 'Backup frequency', isPublic: false },
      { key: 'logoUrl', value: '/images/logo.svg', type: 'string', description: 'Site logo URL', isPublic: true },
      { key: 'logoAlt', value: 'شعار شركة الحصان الذهبي للشحن', type: 'string', description: 'Logo alt text', isPublic: true },
      { key: 'faviconUrl', value: '/favicon.ico', type: 'string', description: 'Site favicon URL', isPublic: true },
    ];

    for (const defaultSetting of defaultSettings) {
      const existing = await this.settingRepository.findOne({ where: { key: defaultSetting.key } });
      if (!existing) {
        await this.settingRepository.save(defaultSetting);
      }
    }
  }

  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private stringifyValue(value: any, type: string): string {
    switch (type) {
      case 'boolean':
        return value.toString();
      case 'number':
        return value.toString();
      case 'json':
        return JSON.stringify(value);
      default:
        return value;
    }
  }

  async uploadLogo(
    files: { logo?: Express.Multer.File[], favicon?: Express.Multer.File[] },
    body: { logoAlt?: string }
  ) {
    const updates: any = {};

    // For now, we'll just update the alt text
    // In a real implementation, you would:
    // 1. Save files to a storage service (AWS S3, local storage, etc.)
    // 2. Get the URLs of the uploaded files
    // 3. Update the settings with the new URLs

    if (body.logoAlt) {
      updates.logoAlt = body.logoAlt;
    }

    // Handle file uploads
    if (files.logo && files.logo[0]) {
      const logoExtension = files.logo[0].originalname.split('.').pop();
      const logoFilename = `logo-${Date.now()}.${logoExtension}`;
      updates.logoUrl = `/uploads/${logoFilename}`;
      this.logger.log(`Logo file received: ${files.logo[0].originalname}`);

      // TODO: Move file to uploads directory
      // const fs = require('fs');
      // const path = require('path');
      // const uploadsDir = path.join(process.cwd(), 'uploads');
      // if (!fs.existsSync(uploadsDir)) {
      //   fs.mkdirSync(uploadsDir, { recursive: true });
      // }
      // fs.writeFileSync(path.join(uploadsDir, logoFilename), files.logo[0].buffer);
    }

    if (files.favicon && files.favicon[0]) {
      const faviconExtension = files.favicon[0].originalname.split('.').pop();
      const faviconFilename = `favicon-${Date.now()}.${faviconExtension}`;
      updates.faviconUrl = `/uploads/${faviconFilename}`;
      this.logger.log(`Favicon file received: ${files.favicon[0].originalname}`);

      // TODO: Move file to uploads directory
      // const fs = require('fs');
      // const path = require('path');
      // const uploadsDir = path.join(process.cwd(), 'uploads');
      // if (!fs.existsSync(uploadsDir)) {
      //   fs.mkdirSync(uploadsDir, { recursive: true });
      // }
      // fs.writeFileSync(path.join(uploadsDir, faviconFilename), files.favicon[0].buffer);
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }

    return {
      message: 'Logo settings updated successfully',
      data: updates
    };
  }
}
