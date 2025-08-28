import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PhotoController, FileUploadController],
  providers: [PhotoService, FileUploadService, PrismaService],
  exports: [PhotoService, FileUploadService]
})
export class PhotoModule {}
