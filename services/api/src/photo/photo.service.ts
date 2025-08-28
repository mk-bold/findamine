import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGamePhotoDto, CreateCluePhotoDto, UpdatePhotoDto } from './dto/photo.dto';

@Injectable()
export class PhotoService {
  constructor(private prisma: PrismaService) {}

  // Game Photo Management
  async createGamePhoto(createGamePhotoDto: CreateGamePhotoDto, uploadedBy: string) {
    const { gameId, filename, originalName, description, isGameCenter } = createGamePhotoDto;

    // If this is a game center photo, unset any existing game center photos
    if (isGameCenter) {
      await this.prisma.gamePhoto.updateMany({
        where: { gameId, isGameCenter: true },
        data: { isGameCenter: false }
      });
    }

    return this.prisma.gamePhoto.create({
      data: {
        filename,
        originalName,
        description,
        isGameCenter,
        uploadedBy,
        gameId
      },
      include: {
        uploader: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async getGamePhotos(gameId: string) {
    return this.prisma.gamePhoto.findMany({
      where: { gameId },
      include: {
        uploader: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { isGameCenter: 'desc' },
        { isFavorited: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async toggleGamePhotoFavorite(photoId: string, gameManagerId: string) {
    const photo = await this.prisma.gamePhoto.findUnique({
      where: { id: photoId },
      include: { game: true }
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Verify the user is the game manager
    if (photo.game.createdBy !== gameManagerId) {
      throw new BadRequestException('Only game managers can favorite photos');
    }

    return this.prisma.gamePhoto.update({
      where: { id: photoId },
      data: { isFavorited: !photo.isFavorited }
    });
  }

  async deleteGamePhoto(photoId: string, userId: string) {
    const photo = await this.prisma.gamePhoto.findUnique({
      where: { id: photoId },
      include: { game: true }
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Only the uploader or game manager can delete photos
    if (photo.uploadedBy !== userId && photo.game.createdBy !== userId) {
      throw new BadRequestException('You can only delete your own photos or photos from games you manage');
    }

    return this.prisma.gamePhoto.delete({
      where: { id: photoId }
    });
  }

  // Clue Photo Management
  async createCluePhoto(createCluePhotoDto: CreateCluePhotoDto, uploadedBy: string) {
    const { clueLocationId, gameId, filename, originalName, description, isCluePhoto } = createCluePhotoDto;

    // If this is a clue photo, unset any existing clue photos for this location
    if (isCluePhoto) {
      await this.prisma.cluePhoto.updateMany({
        where: { clueLocationId, isCluePhoto: true },
        data: { isCluePhoto: false }
      });
    }

    return this.prisma.cluePhoto.create({
      data: {
        filename,
        originalName,
        description,
        isCluePhoto,
        uploadedBy,
        clueLocationId,
        gameId
      },
      include: {
        uploader: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true
          }
        },
        clueLocation: {
          select: {
            id: true,
            identifyingName: true,
            anonymizedName: true
          }
        }
      }
    });
  }

  async getCluePhotos(clueLocationId: string, gameId?: string) {
    const where: any = { clueLocationId };
    if (gameId) {
      where.OR = [
        { gameId: null }, // Photos not associated with a specific game
        { gameId } // Photos associated with the specific game
      ];
    }

    return this.prisma.cluePhoto.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true
          }
        },
        clueLocation: {
          select: {
            id: true,
            identifyingName: true,
            anonymizedName: true
          }
        }
      },
      orderBy: [
        { isCluePhoto: 'desc' },
        { isFavorited: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async toggleCluePhotoFavorite(photoId: string, gameManagerId: string) {
    const photo = await this.prisma.cluePhoto.findUnique({
      where: { id: photoId },
      include: { 
        clueLocation: {
          include: {
            gameClues: {
              include: { game: true }
            }
          }
        }
      }
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Verify the user is a game manager for a game that uses this clue location
    const isGameManager = photo.clueLocation.gameClues.some(
      gameClue => gameClue.game.createdBy === gameManagerId
    );

    if (!isGameManager) {
      throw new BadRequestException('Only game managers can favorite clue photos');
    }

    return this.prisma.cluePhoto.update({
      where: { id: photoId },
      data: { isFavorited: !photo.isFavorited }
    });
  }

  async deleteCluePhoto(photoId: string, userId: string) {
    const photo = await this.prisma.cluePhoto.findUnique({
      where: { id: photoId },
      include: {
        clueLocation: {
          include: {
            gameClues: {
              include: { game: true }
            }
          }
        }
      }
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Only the uploader or a game manager can delete photos
    const isGameManager = photo.clueLocation.gameClues.some(
      gameClue => gameClue.game.createdBy === userId
    );

    if (photo.uploadedBy !== userId && !isGameManager) {
      throw new BadRequestException('You can only delete your own photos or photos from games you manage');
    }

    return this.prisma.cluePhoto.delete({
      where: { id: photoId }
    });
  }

  // Get user's photos
  async getUserGamePhotos(userId: string) {
    return this.prisma.gamePhoto.findMany({
      where: { uploadedBy: userId },
      include: {
        game: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserCluePhotos(userId: string) {
    return this.prisma.cluePhoto.findMany({
      where: { uploadedBy: userId },
      include: {
        clueLocation: {
          select: {
            id: true,
            identifyingName: true,
            anonymizedName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Photo Search and Discovery
  async searchPhotos(query: string, gameId?: string) {
    const where: any = {
      OR: [
        { originalName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (gameId) {
      where.OR = [
        { gameId, ...where.OR },
        { gameId: null, ...where.OR }
      ];
    }

    const [gamePhotos, cluePhotos] = await Promise.all([
      this.prisma.gamePhoto.findMany({
        where: { ...where, gameId },
        include: {
          uploader: {
            select: {
              id: true,
              gamerTag: true,
              firstName: true,
              lastName: true
            }
          },
          game: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 20
      }),
      this.prisma.cluePhoto.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              gamerTag: true,
              firstName: true,
              lastName: true
            }
          },
          clueLocation: {
            select: {
              id: true,
              identifyingName: true,
              anonymizedName: true
            }
          }
        },
        take: 20
      })
    ]);

    return {
      gamePhotos,
      cluePhotos
    };
  }
}
