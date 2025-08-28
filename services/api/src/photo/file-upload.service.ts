import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE') || 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Create subdirectories for different photo types
    const subdirs = ['game-photos', 'clue-photos', 'temp'];
    subdirs.forEach(subdir => {
      const fullPath = path.join(this.uploadDir, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async uploadPhoto(
    file: Express.Multer.File,
    photoType: 'game' | 'clue',
    metadata: {
      gameId?: string;
      clueLocationId?: string;
      userId: string;
    }
  ): Promise<{
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    
    // Determine subdirectory
    const subdir = photoType === 'game' ? 'game-photos' : 'clue-photos';
    const relativePath = path.join(subdir, filename);
    const fullPath = path.join(this.uploadDir, relativePath);

    // Save file
    try {
      fs.writeFileSync(fullPath, file.buffer);
    } catch (error) {
      throw new BadRequestException('Failed to save uploaded file');
    }

    return {
      filename,
      originalName: file.originalname,
      filePath: relativePath,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
  }

  async deletePhoto(filename: string, photoType: 'game' | 'clue'): Promise<void> {
    const subdir = photoType === 'game' ? 'game-photos' : 'clue-photos';
    const filePath = path.join(this.uploadDir, subdir, filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }

  getPhotoUrl(filename: string, photoType: 'game' | 'clue'): string {
    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:4000';
    const subdir = photoType === 'game' ? 'game-photos' : 'clue-photos';
    return `${baseUrl}/uploads/${subdir}/${filename}`;
  }

  async resizePhoto(
    filePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<Buffer> {
    // This is a placeholder for image resizing functionality
    // In a production environment, you'd want to use a library like sharp or jimp
    // For now, we'll return the original file buffer
    
    const fullPath = path.join(this.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    
    throw new BadRequestException('File not found for resizing');
  }

  async generateThumbnail(
    filePath: string,
    size: { width: number; height: number } = { width: 150, height: 150 }
  ): Promise<Buffer> {
    // This is a placeholder for thumbnail generation
    // In a production environment, you'd want to use a library like sharp or jimp
    // For now, we'll return the original file buffer
    
    const fullPath = path.join(this.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    
    throw new BadRequestException('File not found for thumbnail generation');
  }
}
