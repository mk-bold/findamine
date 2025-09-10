import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { 
  GameStatus, 
  ClueReleaseSchedule, 
  TimeDiscountType, 
  PrivacyLevel,
  PrizeType,
  PrizeDistribution,
  PrizeDelivery,
  QuestionType,
  PointTrackingMode,
  TreatmentAssignmentType
} from '@prisma/client';

// DTOs for creating and updating games
export interface CreateGameDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing?: boolean;
  
  // Game center location
  gameCenterLat?: number;
  gameCenterLng?: number;
  gameCenterAddress?: string;
  
  // Game settings
  maxPlayers?: number;
  prizePool?: number;
  entryFee?: number;
  rules?: string;
  isPublic?: boolean;
  gameCode?: string;
  
  clueReleaseSchedule?: ClueReleaseSchedule;
  customReleaseTimes?: any;
  baseCluePoints?: number;
  timeDiscountType?: TimeDiscountType;
  timeDiscountRate?: number;
  profileCompletionPoints?: number;
  referralPoints?: number;
  followerPoints?: number;
  privacyBonusPoints?: any;
  pointTrackingMode?: PointTrackingMode;
  
  // Prize settings
  prizeType?: PrizeType;
  prizeDistribution?: PrizeDistribution;
  prizeDelivery?: PrizeDelivery;
}

export interface UpdateGameDto extends Partial<CreateGameDto> {
  status?: GameStatus;
}

// DTOs for clue locations
export interface CreateClueLocationDto {
  identifyingName: string;
  anonymizedName: string;
  latitude: number;
  longitude: number;
  text: string;
  hint?: string;
  gpsVerificationRadius?: number;
  requiresSelfie?: boolean;
}

export interface UpdateClueLocationDto extends Partial<CreateClueLocationDto> {}

// DTOs for game clues
export interface CreateGameClueDto {
  clueLocationId: string;
  customText?: string;
  customHint?: string;
  points?: number;
  releaseTime?: Date;
}

export interface UpdateGameClueDto extends Partial<CreateGameClueDto> {
  isReleased?: boolean;
}

// DTOs for prizes
export interface CreatePrizeDto {
  name: string;
  description?: string;
  type: PrizeType;
  distribution: PrizeDistribution;
  delivery?: PrizeDelivery;
  value?: string;
  frequency?: string;
}

// DTOs for surveys
export interface CreateSurveyDto {
  name: string;
  description?: string;
  questions: CreateSurveyQuestionDto[];
}

export interface CreateSurveyQuestionDto {
  question: string;
  type: QuestionType;
  pointScaleId: string;
}

// DTOs for teams
export interface CreateTeamDto {
  name: string;
  description?: string;
  isCrossGame?: boolean;
  memberIds?: string[];
}

// DTOs for treatments
export interface CreateTreatmentDto {
  name: string;
  description: string;
}

export interface CreateGameTreatmentDto {
  treatmentId: string;
  assignmentType?: TreatmentAssignmentType;
}

// DTOs for player management
export interface AddPlayerDto {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface BatchAddPlayersDto {
  players: AddPlayerDto[];
}

@Injectable()
export class GameMasterService {
  constructor(private prisma: PrismaService) {}

  // ===== GAME MANAGEMENT =====
  
  async createGame(creatorId: string, gameData: CreateGameDto) {
    // Convert string dates to Date objects if they exist
    const processedData: any = { ...gameData };
    if (processedData.startDate && typeof processedData.startDate === 'string') {
      processedData.startDate = new Date(processedData.startDate);
    }
    
    // Handle endDate properly - if it's an empty string or ongoing game, remove it
    if (processedData.endDate !== undefined && typeof processedData.endDate === 'string') {
      if (processedData.endDate.trim() !== '') {
        processedData.endDate = new Date(processedData.endDate);
      } else {
        delete processedData.endDate;
      }
    }

    // Handle boolean conversion for isOngoing if it comes as string
    if (typeof processedData.isOngoing === 'string') {
      processedData.isOngoing = processedData.isOngoing === 'true' || processedData.isOngoing === 'on';
    }

    // Convert string numbers to actual numbers
    const numericFields = ['maxPlayers', 'prizePool', 'entryFee', 'baseCluePoints', 'timeDiscountRate', 'profileCompletionPoints', 'referralPoints', 'followerPoints'];
    numericFields.forEach(field => {
      if (processedData[field] && typeof processedData[field] === 'string') {
        const numValue = parseFloat(processedData[field]);
        if (!isNaN(numValue)) {
          processedData[field] = numValue;
        }
      }
    });

    // Handle empty gameCode
    if (processedData.gameCode === '') {
      delete processedData.gameCode;
    }

    // Handle prizeType array - convert array to single value
    if (Array.isArray(processedData.prizeType) && processedData.prizeType.length > 0) {
      processedData.prizeType = processedData.prizeType[0];
    }

    // Filter out fields that don't belong to the Game model
    const { photos, photoDescriptions, ...cleanGameData } = processedData;

    return this.prisma.game.create({
      data: {
        ...cleanGameData,
        createdBy: creatorId,
      },
      include: {
        creator: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async getGames(userId: string, userRole: string, status?: GameStatus) {
    let where: any = {};
    
    // Role-based filtering
    if (userRole === 'GAME_MANAGER' || userRole === 'ADMIN') {
      // Game managers and admins can see all games
      if (status) where.status = status;
    } else {
      // Players can only see their own created games
      where.createdBy = userId;
      if (status) where.status = status;
    }

    const games = await this.prisma.game.findMany({
      where,
      include: {
        creator: { 
          select: { 
            id: true, 
            email: true, 
            firstName: true, 
            lastName: true, 
            gamerTag: true 
          } 
        },
        gamePhotos: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            playerGames: true,
            gameClues: true,
            prizes: true,
            surveys: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${games.length} games for user ${userId} with role ${userRole}`);

    // Add current players count and calculate remaining spots
    const gamesWithPlayerCounts = games.map(game => {
      const currentPlayers = game._count.playerGames || 0;
      const maxPlayers = game.maxPlayers || 0;
      const remainingSpots = maxPlayers > 0 ? Math.max(0, maxPlayers - currentPlayers) : null;
      
      console.log(`Game ${game.id} (${game.name}) - Current: ${currentPlayers}, Max: ${maxPlayers}, Remaining: ${remainingSpots}`);
      
      return {
        ...game,
        remainingSpots,
        currentPlayers
      };
    });
    
    return gamesWithPlayerCounts;
  }

  async getGameById(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId },
      include: {
        creator: { select: { id: true, email: true, firstName: true, lastName: true } },
        gamePhotos: {
          orderBy: { createdAt: 'asc' }
        },
        playerGames: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
        },
        gameClues: {
          include: { clueLocation: true }
        },
        prizes: true,
        surveys: {
          include: { survey: true }
        },
        teams: true,
        treatments: {
          include: { treatment: true }
        }
      }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async updateGame(gameId: string, creatorId: string, updateData: UpdateGameDto) {
    console.log('Received update data:', JSON.stringify(updateData, null, 2));
    
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Apply the same data processing as createGame
    const processedData: any = { ...updateData };
    if (processedData.startDate && typeof processedData.startDate === 'string') {
      processedData.startDate = new Date(processedData.startDate);
    }
    
    // Handle endDate properly - if it's an empty string or ongoing game, remove it
    if (processedData.endDate !== undefined && typeof processedData.endDate === 'string') {
      if (processedData.endDate.trim() !== '') {
        processedData.endDate = new Date(processedData.endDate);
      } else {
        delete processedData.endDate;
      }
    }

    // Handle boolean conversion for isOngoing if it comes as string
    if (typeof processedData.isOngoing === 'string') {
      processedData.isOngoing = processedData.isOngoing === 'true' || processedData.isOngoing === 'on';
    }

    // Convert string numbers to actual numbers
    const numericFields = ['maxPlayers', 'prizePool', 'entryFee', 'baseCluePoints', 'timeDiscountRate', 'profileCompletionPoints', 'referralPoints', 'followerPoints'];
    numericFields.forEach(field => {
      if (processedData[field] && typeof processedData[field] === 'string') {
        const numValue = parseFloat(processedData[field]);
        if (!isNaN(numValue)) {
          processedData[field] = numValue;
        }
      }
    });

    // Handle empty gameCode
    if (processedData.gameCode === '') {
      delete processedData.gameCode;
    }

    // Handle prizeType array - convert array to single value
    if (Array.isArray(processedData.prizeType) && processedData.prizeType.length > 0) {
      processedData.prizeType = processedData.prizeType[0];
    }

    // Filter out fields that don't belong to the Game model schema
    // These fields are not part of the current Game model - they are either form-specific or belong to other models
    const {
      photos,
      photoDescriptions,
      existingPhotos,
      // Keep prize fields as they may be part of the Game model now
      // prizePool,        // Keep - might be part of Game model
      // entryFee,         // Keep - might be part of Game model  
      // rules,            // Keep - might be part of Game model
      // isPublic,         // Keep - might be part of Game model
      // gameCode,         // Keep - might be part of Game model
      // prizeType,        // Keep - might be part of Game model
      // prizeDistribution, // Keep - might be part of Game model
      // prizeDelivery,    // Keep - might be part of Game model
      ...gameData
    } = processedData;

    console.log('Final gameData being sent to Prisma update:', JSON.stringify(gameData, null, 2));
    
    return this.prisma.game.update({
      where: { id: gameId },
      data: gameData,
      include: {
        creator: { select: { id: true, email: true, lastName: true } }
      }
    });
  }

  async deleteGame(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status === 'ACTIVE') {
      throw new ForbiddenException('Cannot delete an active game');
    }

    return this.prisma.game.delete({
      where: { id: gameId }
    });
  }

  // ===== CLUE LOCATION MANAGEMENT =====

  async createClueLocation(locationData: CreateClueLocationDto) {
    return this.prisma.clueLocation.create({
      data: locationData
    });
  }

  async getClueLocations(search?: string, lat?: number, lng?: number, radius?: number) {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { identifyingName: { contains: search, mode: 'insensitive' } },
        { anonymizedName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (lat && lng && radius) {
      // Convert radius from miles to approximate degrees
      // 1 degree of latitude ≈ 69 miles
      // 1 degree of longitude ≈ 69 * cos(latitude) miles
      const latRange = radius / 69;
      const lngRange = radius / (69 * Math.cos(lat * Math.PI / 180));
      
      where.AND = [
        { latitude: { gte: lat - latRange, lte: lat + latRange } },
        { longitude: { gte: lng - lngRange, lte: lng + lngRange } }
      ];
    }

    return this.prisma.clueLocation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getClueLocationById(id: string) {
    const location = await this.prisma.clueLocation.findUnique({
      where: { id }
    });

    if (!location) {
      throw new NotFoundException('Clue location not found');
    }

    return location;
  }

  async updateClueLocation(id: string, updateData: UpdateClueLocationDto) {
    const location = await this.prisma.clueLocation.findUnique({
      where: { id }
    });

    if (!location) {
      throw new NotFoundException('Clue location not found');
    }

    return this.prisma.clueLocation.update({
      where: { id },
      data: updateData
    });
  }

  // ===== GAME CLUE MANAGEMENT =====

  async addClueToGame(gameId: string, creatorId: string, clueData: CreateGameClueDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Check if clue already exists in this game
    const existingClue = await this.prisma.gameClue.findUnique({
      where: {
        gameId_clueLocationId: {
          gameId,
          clueLocationId: clueData.clueLocationId
        }
      }
    });

    if (existingClue) {
      throw new ConflictException('This clue location is already added to this game');
    }

    return this.prisma.gameClue.create({
      data: {
        ...clueData,
        gameId
      },
      include: {
        clueLocation: true
      }
    });
  }

  async getGameClues(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.gameClue.findMany({
      where: { gameId },
      include: {
        clueLocation: true,
        _count: { select: { findings: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async updateGameClue(gameId: string, clueId: string, creatorId: string, updateData: UpdateGameClueDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const clue = await this.prisma.gameClue.findFirst({
      where: { id: clueId, gameId }
    });

    if (!clue) {
      throw new NotFoundException('Clue not found');
    }

    return this.prisma.gameClue.update({
      where: { id: clueId },
      data: updateData,
      include: { clueLocation: true }
    });
  }

  async removeClueFromGame(gameId: string, clueId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.gameClue.delete({
      where: { id: clueId }
    });
  }

  // ===== PRIZE MANAGEMENT =====

  async createPrize(gameId: string, creatorId: string, prizeData: CreatePrizeDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.prize.create({
      data: {
        ...prizeData,
        gameId
      }
    });
  }

  async getGamePrizes(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.prize.findMany({
      where: { gameId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // ===== SURVEY MANAGEMENT =====

  async createSurvey(surveyData: CreateSurveyDto) {
    return this.prisma.survey.create({
      data: {
        name: surveyData.name,
        description: surveyData.description,
        questions: {
          create: surveyData.questions.map(q => ({
            question: q.question,
            type: q.type,
            pointScaleId: q.pointScaleId
          }))
        }
      },
      include: {
        questions: {
          include: { pointScale: true }
        }
      }
    });
  }

  async assignSurveyToGame(gameId: string, creatorId: string, surveyId: string, points?: number) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.gameSurvey.create({
      data: {
        gameId,
        surveyId,
        points: points || 10
      },
      include: { survey: true }
    });
  }

  // ===== TEAM MANAGEMENT =====

  async createTeam(gameId: string, creatorId: string, teamData: CreateTeamDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const team = await this.prisma.team.create({
      data: {
        ...teamData,
        gameId: teamData.isCrossGame ? null : gameId
      }
    });

    // Add members if provided
    if (teamData.memberIds && teamData.memberIds.length > 0) {
      await this.prisma.teamMember.createMany({
        data: teamData.memberIds.map(userId => ({
          teamId: team.id,
          userId,
          role: 'member'
        }))
      });
    }

    return team;
  }

  // ===== TREATMENT MANAGEMENT =====

  async createTreatment(treatmentData: CreateTreatmentDto) {
    return this.prisma.treatment.create({
      data: treatmentData
    });
  }

  async assignTreatmentToGame(gameId: string, creatorId: string, treatmentData: CreateGameTreatmentDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.gameTreatment.create({
      data: {
        ...treatmentData,
        gameId
      },
      include: { treatment: true }
    });
  }

  // ===== PLAYER MANAGEMENT =====

  async addPlayerToGame(gameId: string, creatorId: string, playerData: AddPlayerDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Check if user exists, create if not
    let user = await this.prisma.user.findUnique({
      where: { email: playerData.email }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: playerData.email,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          password: 'temp_password', // Will need to be changed on first login
          role: 'PLAYER'
        }
      });
    }

    // Add to game
    return this.prisma.playerGame.create({
      data: {
        userId: user.id,
        gameId
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } }
      }
    });
  }

  async batchAddPlayersToGame(gameId: string, creatorId: string, batchData: BatchAddPlayersDto) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const results = [];
    
    for (const playerData of batchData.players) {
      try {
        const result = await this.addPlayerToGame(gameId, creatorId, playerData);
        results.push({ success: true, data: result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ success: false, error: errorMessage, data: playerData });
      }
    }

    return results;
  }

  async removePlayerFromGame(gameId: string, creatorId: string, userId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.playerGame.update({
      where: { userId_gameId: { userId, gameId } },
      data: { isActive: false, leftAt: new Date() }
    });
  }

  // ===== CHAT MODERATION =====

  async deleteChatPost(gameId: string, creatorId: string, postId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.chatPost.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: creatorId
      }
    });
  }

  // ===== GAME STATISTICS =====

  async getGameStats(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const [totalPlayers, activePlayers, totalClues, totalFindings, totalPoints] = await Promise.all([
      this.prisma.playerGame.count({ where: { gameId } }),
      this.prisma.playerGame.count({ where: { gameId, isActive: true } }),
      this.prisma.gameClue.count({ where: { gameId } }),
      this.prisma.clueFinding.count({ 
        where: { gameClue: { gameId } } 
      }),
      this.prisma.playerGame.aggregate({
        where: { gameId, isActive: true },
        _sum: { totalPoints: true }
      })
    ]);

    return {
      game: {
        id: game.id,
        name: game.name,
        status: game.status,
        startDate: game.startDate,
        endDate: game.endDate
      },
      players: {
        total: totalPlayers,
        active: activePlayers,
        inactive: totalPlayers - activePlayers
      },
      clues: {
        total: totalClues,
        findings: totalFindings
      },
      points: {
        total: totalPoints._sum.totalPoints || 0
      }
    };
  }

  async getGameMasterStats(userId: string) {
    console.log('🔍 Getting Game Master stats for userId:', userId);
    
    // Get general statistics for the game master
    const [totalGames, activeGames, totalClueLocations, totalPlayers, totalClues, totalFindings, allPlayers] = await Promise.all([
      this.prisma.game.count({ where: { createdBy: userId } }),
      this.prisma.game.count({ where: { createdBy: userId, status: 'ACTIVE' } }),
      this.prisma.clueLocation.count(),
      this.prisma.playerGame.count({ 
        where: { 
          game: { createdBy: userId },
          isActive: true 
        } 
      }),
      this.prisma.gameClue.count({ where: { game: { createdBy: userId } } }),
      this.prisma.clueFinding.count({ 
        where: { gameClue: { game: { createdBy: userId } } } 
      }),
      // For game managers, show all players in the platform
      this.prisma.user.count({ where: { role: 'PLAYER' } })
    ]);

    console.log('📊 Game Master stats results:', {
      totalGames,
      activeGames, 
      totalClueLocations,
      totalPlayers,
      totalClues,
      totalFindings,
      allPlayers
    });

    const stats = {
      totalUsers: 0, // Not applicable for game master
      totalPlayers: allPlayers, // All players on platform
      activeUsers: 0, // Not applicable for game master
      totalGames,
      activeGames,
      totalClues,
      totalFindings,
      recentActivity: [] // Could be populated with recent game activities
    };

    console.log('📤 Returning Game Master stats:', stats);
    return stats;
  }

  async validateGameCode(gameCode: string, excludeGameId?: string): Promise<boolean> {
    if (!gameCode || !gameCode.trim()) {
      return true; // Empty codes are valid
    }

    const where: any = { gameCode: gameCode.trim() };
    if (excludeGameId) {
      where.id = { not: excludeGameId };
    }

    const existingGame = await this.prisma.game.findFirst({
      where,
      select: { id: true }
    });

    return !existingGame; // Available if no existing game found
  }

  async getClueLocationGameCount(creatorId: string, clueLocationId: string) {
    // Count active and draft games that use this clue location
    const gameCount = await this.prisma.game.count({
      where: {
        createdBy: creatorId,
        status: {
          in: ['DRAFT', 'ACTIVE']
        },
        gameClues: {
          some: {
            clueLocationId: clueLocationId
          }
        }
      }
    });

    return { count: gameCount };
  }
} 