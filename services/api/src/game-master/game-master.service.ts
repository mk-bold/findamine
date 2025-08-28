import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  customName?: string;
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
    return this.prisma.game.create({
      data: {
        ...gameData,
        createdBy: creatorId,
      },
      include: {
        creator: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async getGames(creatorId: string, status?: GameStatus) {
    const where: any = { createdBy: creatorId };
    if (status) where.status = status;

    return this.prisma.game.findMany({
      where,
      include: {
        creator: { select: { id: true, email: true, firstName: true, lastName: true } },
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
  }

  async getGameById(gameId: string, creatorId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId },
      include: {
        creator: { select: { id: true, email: true, firstName: true, lastName: true } },
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
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, createdBy: creatorId }
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        creator: { select: { id: true, email: true, firstName: true, lastName: true } }
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
      // Simple distance calculation (can be enhanced with PostGIS)
      where.AND = [
        { latitude: { gte: lat - (radius / 111000), lte: lat + (radius / 111000) } },
        { longitude: { gte: lng - (radius / (111000 * Math.cos(lat * Math.PI / 180))), lte: lng + (radius / (111000 * Math.cos(lat * Math.PI / 180))) } }
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
} 