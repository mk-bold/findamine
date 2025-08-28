import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles, Role } from '../common/guards/role.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post('game-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadGamePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      gameId: string;
      description?: string;
      isGameCenter?: string;
    },
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No photo file provided');
    }

    if (!body.gameId) {
      throw new BadRequestException('Game ID is required');
    }

    // Upload the file
    const uploadResult = await this.fileUploadService.uploadPhoto(
      file,
      'game',
      {
        gameId: body.gameId,
        userId: req.user.id
      }
    );

    // Create the photo record in the database
    const photo = await this.photoService.createGamePhoto(
      {
        gameId: body.gameId,
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        description: body.description,
        isGameCenter: body.isGameCenter === 'true'
      },
      req.user.id
    );

    return {
      ...photo,
      fileUrl: this.fileUploadService.getPhotoUrl(uploadResult.filename, 'game'),
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType
    };
  }

  @Post('clue-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadCluePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      clueLocationId: string;
      gameId?: string;
      description?: string;
      isCluePhoto?: string;
    },
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No photo file provided');
    }

    if (!body.clueLocationId) {
      throw new BadRequestException('Clue location ID is required');
    }

    // Upload the file
    const uploadResult = await this.fileUploadService.uploadPhoto(
      file,
      'clue',
      {
        clueLocationId: body.clueLocationId,
        gameId: body.gameId,
        userId: req.user.id
      }
    );

    // Create the photo record in the database
    const photo = await this.photoService.createCluePhoto(
      {
        clueLocationId: body.clueLocationId,
        gameId: body.gameId,
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        description: body.description,
        isCluePhoto: body.isCluePhoto === 'true'
      },
      req.user.id
    );

    return {
      ...photo,
      fileUrl: this.fileUploadService.getPhotoUrl(uploadResult.filename, 'clue'),
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType
    };
  }

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('photos', { limits: { files: 10 } }))
  @UseGuards(RoleGuard)
  @Roles(Role.GAME_MASTER, Role.ADMIN)
  async bulkUploadPhotos(
    @UploadedFile() files: Express.Multer.File[],
    @Body() body: {
      gameId: string;
      clueLocationId?: string;
      description?: string;
    },
    @Request() req: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No photo files provided');
    }

    if (!body.gameId) {
      throw new BadRequestException('Game ID is required');
    }

    const results = [];

    for (const file of files) {
      try {
        const photoType = body.clueLocationId ? 'clue' : 'game';
        
        // Upload the file
        const uploadResult = await this.fileUploadService.uploadPhoto(
          file,
          photoType,
          {
            gameId: body.gameId,
            clueLocationId: body.clueLocationId,
            userId: req.user.id
          }
        );

        // Create the photo record in the database
        let photo;
        if (photoType === 'game') {
          photo = await this.photoService.createGamePhoto(
            {
              gameId: body.gameId,
              filename: uploadResult.filename,
              originalName: uploadResult.originalName,
              description: body.description
            },
            req.user.id
          );
        } else {
          photo = await this.photoService.createCluePhoto(
            {
              clueLocationId: body.clueLocationId!,
              gameId: body.gameId,
              filename: uploadResult.filename,
              originalName: uploadResult.originalName,
              description: body.description
            },
            req.user.id
          );
        }

        results.push({
          ...photo,
          fileUrl: this.fileUploadService.getPhotoUrl(uploadResult.filename, photoType),
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          success: true
        });
      } catch (error) {
        results.push({
          originalName: file.originalname,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      totalFiles: files.length,
      successfulUploads: results.filter(r => r.success).length,
      failedUploads: results.filter(r => !r.success).length,
      results
    };
  }
}
