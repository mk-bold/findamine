import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CreateGamePhotoDto, CreateCluePhotoDto, UpdatePhotoDto } from './dto/photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles, Role } from '../common/guards/role.guard';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  // Game Photo Endpoints
  @Post('game')
  async createGamePhoto(
    @Body() createGamePhotoDto: CreateGamePhotoDto,
    @Request() req: any
  ) {
    return this.photoService.createGamePhoto(createGamePhotoDto, req.user.id);
  }

  @Get('game/:gameId')
  async getGamePhotos(@Param('gameId', ParseUUIDPipe) gameId: string) {
    return this.photoService.getGamePhotos(gameId);
  }

  @Put('game/:photoId/favorite')
  @UseGuards(RoleGuard)
  @Roles(Role.GAME_MASTER, Role.ADMIN)
  async toggleGamePhotoFavorite(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Request() req: any
  ) {
    return this.photoService.toggleGamePhotoFavorite(photoId, req.user.id);
  }

  @Delete('game/:photoId')
  async deleteGamePhoto(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Request() req: any
  ) {
    return this.photoService.deleteGamePhoto(photoId, req.user.id);
  }

  // Clue Photo Endpoints
  @Post('clue')
  async createCluePhoto(
    @Body() createCluePhotoDto: CreateCluePhotoDto,
    @Request() req: any
  ) {
    return this.photoService.createCluePhoto(createCluePhotoDto, req.user.id);
  }

  @Get('clue/:clueLocationId')
  async getCluePhotos(
    @Param('clueLocationId', ParseUUIDPipe) clueLocationId: string,
    @Query('gameId') gameId?: string
  ) {
    return this.photoService.getCluePhotos(clueLocationId, gameId);
  }

  @Put('clue/:photoId/favorite')
  @UseGuards(RoleGuard)
  @Roles(Role.GAME_MASTER, Role.ADMIN)
  async toggleCluePhotoFavorite(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Request() req: any
  ) {
    return this.photoService.toggleCluePhotoFavorite(photoId, req.user.id);
  }

  @Delete('clue/:photoId')
  async deleteCluePhoto(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Request() req: any
  ) {
    return this.photoService.deleteCluePhoto(photoId, req.user.id);
  }

  // Search and Discovery
  @Get('search')
  async searchPhotos(
    @Query('q') query: string,
    @Query('gameId') gameId?: string
  ) {
    if (!query || query.trim().length < 2) {
      return { gamePhotos: [], cluePhotos: [] };
    }
    return this.photoService.searchPhotos(query.trim(), gameId);
  }

  // User's Photos
  @Get('my-photos')
  async getMyPhotos(@Request() req: any) {
    const [gamePhotos, cluePhotos] = await Promise.all([
      this.photoService.getUserGamePhotos(req.user.id),
      this.photoService.getUserCluePhotos(req.user.id)
    ]);

    return { gamePhotos, cluePhotos };
  }
}
