import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Ad } from '../../entities/ad.entity';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ad]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/ads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
