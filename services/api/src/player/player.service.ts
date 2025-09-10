import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { 
  PrivacyLevel,
  GameStatus,
  ClueReleaseSchedule
} from '@prisma/client';

// DTOs for player actions
export interface FindClueDto {
  gameClueId: string;
  gpsLatitude: number;
  gpsLongitude: number;
  selfiePhoto?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  statusMessage?: string;
  homeCity?: string;
  favoritePlayZones?: string[];
  hobbies?: string[];
  bestFindMemory?: string;
  education?: string[];
  degrees?: string[];
  workHistory?: string[];
  profilePicture?: string;
}

export interface UpdatePrivacyDto {
  privacyLevel: PrivacyLevel;
}

export interface CreateSocialConnectionDto {
  followingId: string;
}

export interface CreateReferralDto {
  referredEmail: string;
  referredFirstName?: string;
  referredLastName?: string;
}

export interface UpdateProfileDataDto {
  phoneNumber?: string;
  homeAddress?: string;
  education?: string;
  highSchool?: string;
  college?: string;
  shoppingPatterns?: string;
}

export interface SurveyResponseDto {
  questionId: string;
  answer: string;
}

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // ===== GAME PARTICIPATION =====
  
  async getAvailableGames(userId: string) {
    const activeGames = await this.prisma.game.findMany({
      where: {
        status: 'ACTIVE',
        isOngoing: true,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      },
      include: {
        creator: { select: { firstName: true, lastName: true } },
        _count: {
          select: {
            playerGames: true,
            gameClues: true,
            prizes: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    // Check which games the user is already participating in
    const userParticipations = await this.prisma.playerGame.findMany({
      where: { userId },
      select: { gameId: true, isActive: true }
    });

    const participatingGameIds = userParticipations
      .filter(p => p.isActive)
      .map(p => p.gameId);

    // Calculate player count for each game
    const gamesWithPlayerCounts = activeGames.map(game => {
      const currentPlayers = game._count.playerGames || 0;
      
      return {
        ...game,
        remainingSpots: null, // No maxPlayers constraint in current schema
        currentPlayers,
        isJoined: participatingGameIds.includes(game.id),
        canJoin: !participatingGameIds.includes(game.id) // Any player can join since no max limit
      };
    });

    return gamesWithPlayerCounts;
  }

  async joinGame(userId: string, gameId: string) {
    // Check if game exists and is active
    const game = await this.prisma.game.findFirst({
      where: { 
        id: gameId,
        status: 'ACTIVE',
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      }
    });

    if (!game) {
      throw new NotFoundException('Game not found or not available for joining');
    }

    // Check if user is already participating
    const existingParticipation = await this.prisma.playerGame.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (existingParticipation) {
      if (existingParticipation.isActive) {
        throw new BadRequestException('Already participating in this game');
      } else {
        // Reactivate participation
        return this.prisma.playerGame.update({
          where: { userId_gameId: { userId, gameId } },
          data: { isActive: true, leftAt: null }
        });
      }
    }

    // Join the game
    return this.prisma.playerGame.create({
      data: {
        userId,
        gameId,
        isActive: true
      },
      include: {
        game: {
          select: {
            name: true,
            description: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });
  }

  async leaveGame(userId: string, gameId: string) {
    const participation = await this.prisma.playerGame.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!participation) {
      throw new NotFoundException('Not participating in this game');
    }

    return this.prisma.playerGame.update({
      where: { userId_gameId: { userId, gameId } },
      data: { isActive: false, leftAt: new Date() }
    });
  }

  async getMyGames(userId: string) {
    return this.prisma.playerGame.findMany({
      where: { userId, isActive: true },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            isOngoing: true,
            creator: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });
  }

  // ===== CLUE FINDING =====
  
  async getAvailableClues(userId: string, gameId: string) {
    // Check if user is participating in the game
    const participation = await this.prisma.playerGame.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!participation || !participation.isActive) {
      throw new ForbiddenException('Must be participating in the game to view clues');
    }

    const now = new Date();
    
    const availableClues = await this.prisma.gameClue.findMany({
      where: {
        gameId,
        isReleased: true,
        OR: [
          { releaseTime: null },
          { releaseTime: { lte: now } }
        ]
      },
      include: {
        clueLocation: {
          select: {
            identifyingName: true,
            anonymizedName: true,
            latitude: true,
            longitude: true,
            text: true,
            hint: true,
            gpsVerificationRadius: true,
            requiresSelfie: true
          }
        }
      },
      orderBy: { releaseTime: 'asc' }
    });

    // Check which clues the user has already found
    const foundClues = await this.prisma.clueFinding.findMany({
      where: { 
        userId,
        gameClue: { gameId }
      },
      select: { gameClueId: true }
    });

    const foundClueIds = foundClues.map(f => f.gameClueId);

    return availableClues.map(clue => ({
      ...clue,
      isFound: foundClueIds.includes(clue.id),
      // Don't show identifying name if not found
      clueLocation: {
        ...clue.clueLocation,
        identifyingName: foundClueIds.includes(clue.id) 
          ? clue.clueLocation.identifyingName 
          : clue.clueLocation.anonymizedName
      }
    }));
  }

  async findClue(userId: string, gameId: string, findData: FindClueDto) {
    // Check if user is participating in the game
    const participation = await this.prisma.playerGame.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!participation || !participation.isActive) {
      throw new ForbiddenException('Must be participating in the game to find clues');
    }

    // Get the clue details
    const gameClue = await this.prisma.gameClue.findFirst({
      where: { id: findData.gameClueId, gameId },
      include: {
        clueLocation: true,
        game: true
      }
    });

    if (!gameClue) {
      throw new NotFoundException('Clue not found in this game');
    }

    if (!gameClue.isReleased) {
      throw new ForbiddenException('This clue has not been released yet');
    }

    // Check if user already found this clue
    const existingFinding = await this.prisma.clueFinding.findUnique({
      where: { userId_gameClueId: { userId, gameClueId: findData.gameClueId } }
    });

    if (existingFinding) {
      throw new BadRequestException('Already found this clue');
    }

    // Verify GPS location
    const distance = this.calculateDistance(
      findData.gpsLatitude,
      findData.gpsLongitude,
      gameClue.clueLocation.latitude,
      gameClue.clueLocation.longitude
    );

    if (distance > gameClue.clueLocation.gpsVerificationRadius) {
      throw new BadRequestException(`Too far from clue location. Distance: ${distance.toFixed(2)}m, Required: ${gameClue.clueLocation.gpsVerificationRadius}m`);
    }

    // Check if selfie is required
    if (gameClue.clueLocation.requiresSelfie && !findData.selfiePhoto) {
      throw new BadRequestException('Selfie photo is required for this clue');
    }

    // Calculate points with time discount
    const points = this.calculateCluePoints(gameClue, gameClue.game);

    // Create the finding
    const finding = await this.prisma.clueFinding.create({
      data: {
        userId,
        gameClueId: findData.gameClueId,
        gpsLatitude: findData.gpsLatitude,
        gpsLongitude: findData.gpsLongitude,
        selfiePhoto: findData.selfiePhoto,
        points
      },
      include: {
        gameClue: {
          include: {
            clueLocation: true
          }
        }
      }
    });

    // Update player's total points
    await this.prisma.playerGame.update({
      where: { userId_gameId: { userId, gameId } },
      data: { totalPoints: { increment: points } }
    });

    return finding;
  }

  async getMyFindings(userId: string, gameId?: string) {
    const where: any = { userId };
    if (gameId) {
      where.gameClue = { gameId };
    }

    return this.prisma.clueFinding.findMany({
      where,
      include: {
        gameClue: {
          include: {
            clueLocation: {
              select: {
                identifyingName: true,
                anonymizedName: true,
                latitude: true,
                longitude: true
              }
            },
            game: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
      orderBy: { foundAt: 'desc' }
    });
  }

  // ===== PROFILE MANAGEMENT =====
  
  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        statusMessage: true,
        homeCity: true,
        favoritePlayZones: true,
        hobbies: true,
        bestFindMemory: true,
        education: true,
        degrees: true,
        workHistory: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get profile data
    const profileData = await this.prisma.profileData.findFirst({
      where: { userId }
    });

    // Get badges
    const badges = await this.prisma.badge.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Get total points across all games
    const totalPoints = await this.prisma.playerGame.aggregate({
      where: { userId, isActive: true },
      _sum: { totalPoints: true }
    });

    // Get total clues found
    const totalClues = await this.prisma.clueFinding.count({
      where: { userId }
    });

    return {
      ...user,
      profileData,
      badges,
      stats: {
        totalPoints: totalPoints._sum.totalPoints || 0,
        totalClues,
        gamesPlayed: await this.prisma.playerGame.count({
          where: { userId, isActive: true }
        })
      }
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        statusMessage: true,
        homeCity: true,
        favoritePlayZones: true,
        hobbies: true,
        bestFindMemory: true,
        education: true,
        degrees: true,
        workHistory: true,
        updatedAt: true
      }
    });
  }

  async updatePrivacy(userId: string, privacyData: UpdatePrivacyDto) {
    // Update privacy for all active games
    await this.prisma.playerGame.updateMany({
      where: { userId, isActive: true },
      data: { privacyLevel: privacyData.privacyLevel }
    });

    return { message: 'Privacy settings updated for all active games' };
  }

  async updateProfileData(userId: string, updateData: UpdateProfileDataDto) {
    const existingData = await this.prisma.profileData.findFirst({
      where: { userId }
    });

    if (existingData) {
      return this.prisma.profileData.update({
        where: { id: existingData.id },
        data: updateData
      });
    } else {
      return this.prisma.profileData.create({
        data: {
          userId,
          ...updateData
        }
      });
    }
  }

  // ===== SOCIAL FEATURES =====
  
  async followPlayer(userId: string, followingId: string) {
    if (userId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if already following
    const existingConnection = await this.prisma.socialConnection.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId } }
    });

    if (existingConnection) {
      if (existingConnection.isActive) {
        throw new BadRequestException('Already following this player');
      } else {
        // Reactivate connection
        return this.prisma.socialConnection.update({
          where: { followerId_followingId: { followerId: userId, followingId } },
          data: { isActive: true }
        });
      }
    }

    // Create new connection
    return this.prisma.socialConnection.create({
      data: {
        followerId: userId,
        followingId,
        isActive: true
      }
    });
  }

  async unfollowPlayer(userId: string, followingId: string) {
    const connection = await this.prisma.socialConnection.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId } }
    });

    if (!connection) {
      throw new NotFoundException('Not following this player');
    }

    return this.prisma.socialConnection.update({
      where: { followerId_followingId: { followerId: userId, followingId } },
      data: { isActive: false }
    });
  }

  async getMyFollowers(userId: string) {
    return this.prisma.socialConnection.findMany({
      where: { followingId: userId, isActive: true },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            statusMessage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyFollowing(userId: string) {
    return this.prisma.socialConnection.findMany({
      where: { followerId: userId, isActive: true },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            statusMessage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async referPlayer(userId: string, referralData: CreateReferralDto) {
    // Check if already referred this email
    const existingReferral = await this.prisma.referral.findFirst({
      where: {
        referrerId: userId,
        referred: { email: referralData.referredEmail }
      }
    });

    if (existingReferral) {
      throw new BadRequestException('Already referred this email');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: referralData.referredEmail }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // First create the referred user
    const referredUser = await this.prisma.user.create({
      data: {
        email: referralData.referredEmail,
        firstName: referralData.referredFirstName,
        lastName: referralData.referredLastName,
        password: 'temp_password', // Will be changed on first login
        role: 'PLAYER' as any
      }
    });

    // Then create the referral record
    return this.prisma.referral.create({
      data: {
        referrerId: userId,
        referredId: referredUser.id,
        isActive: true
      }
    });
  }

  // ===== LEADERBOARDS =====
  
  async getGameLeaderboard(gameId: string, limit: number = 50) {
    const players = await this.prisma.playerGame.findMany({
      where: { gameId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      },
      orderBy: { totalPoints: 'desc' },
      take: limit
    });

    return players.map((player, index) => ({
      rank: index + 1,
      userId: player.user.id,
      firstName: player.user.firstName,
      lastName: player.user.lastName,
      profilePicture: player.user.profilePicture,
      totalPoints: player.totalPoints,
      joinedAt: player.joinedAt
    }));
  }

  async getGlobalLeaderboard(limit: number = 100) {
    const players = await this.prisma.playerGame.groupBy({
      by: ['userId'],
      _sum: { totalPoints: true },
      _count: { gameId: true },
      orderBy: { _sum: { totalPoints: 'desc' } },
      take: limit
    });

    // Get user details for top players
    const userIds = players.map(p => p.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true
      }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return players.map((player, index) => ({
      rank: index + 1,
      userId: player.userId,
      firstName: userMap.get(player.userId)?.firstName,
      lastName: userMap.get(player.userId)?.lastName,
      profilePicture: userMap.get(player.userId)?.profilePicture,
      totalPoints: player._sum.totalPoints || 0,
      gamesPlayed: player._count.gameId
    }));
  }

  // ===== UTILITY METHODS =====
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateCluePoints(gameClue: any, game: any): number {
    let points = gameClue.points;

    // Apply time discount if enabled
    if (game.timeDiscountType !== 'NONE' && game.timeDiscountRate > 0) {
      const now = new Date();
      const clueReleaseTime = gameClue.releaseTime || game.startDate;
      const timeDiff = now.getTime() - new Date(clueReleaseTime).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (game.timeDiscountType === 'LINEAR') {
        const discount = Math.floor(hoursDiff * game.timeDiscountRate);
        points = Math.max(points - discount, 1); // Minimum 1 point
      } else if (game.timeDiscountType === 'CURVE_LINEAR') {
        const discount = Math.floor(Math.pow(hoursDiff, 1.5) * game.timeDiscountRate);
        points = Math.max(points - discount, 1);
      }
    }

    return points;
  }

  // ===== SOCIAL CONNECTION METHODS =====
  
  async getMinions(userId: string) {
    return this.prisma.socialConnection.findMany({
      where: { followingId: userId, isActive: true },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            statusMessage: true,
            homeCity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getFrenemies(userId: string) {
    return this.prisma.socialConnection.findMany({
      where: { followerId: userId, isActive: true },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            statusMessage: true,
            homeCity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchPlayers(
    userId: string,
    userRole: string,
    search?: string,
    gameId?: string,
    limit: number = 50,
    offset: number = 0
  ) {
    let where: any = {
      isActive: true,
      id: { not: userId } // Exclude current user
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by game participation if gameId provided
    if (gameId) {
      where.playerGames = {
        some: {
          gameId: gameId,
          isActive: true
        }
      };
    }

    const players = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: userRole === 'ADMIN' || userRole === 'GAME_MANAGER' ? true : false,
        profilePicture: true,
        statusMessage: true,
        homeCity: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            playerGames: true,
            clueFindings: true,
            followers: { where: { isActive: true } },
            following: { where: { isActive: true } }
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    // Get current user's social connections to determine follow status
    const userConnections = await this.prisma.socialConnection.findMany({
      where: {
        followerId: userId,
        isActive: true,
        followingId: { in: players.map(p => p.id) }
      },
      select: { followingId: true }
    });

    const followingIds = new Set(userConnections.map(c => c.followingId));

    return players.map(player => ({
      ...player,
      isFollowing: followingIds.has(player.id),
      followerCount: player._count.followers,
      followingCount: player._count.following,
      gamesCount: player._count.playerGames,
      cluesFoundCount: player._count.clueFindings
    }));
  }

  async getPlayerStats(userId: string) {
    // Get player's games
    const playerGames = await this.prisma.playerGame.findMany({
      where: { userId, isActive: true },
      include: { game: true }
    });

    const playerGameIds = playerGames.map(pg => pg.gameId);

    // Count players across all games the user is playing
    const totalPlayersInMyGames = await this.prisma.playerGame.count({
      where: {
        gameId: { in: playerGameIds },
        isActive: true
      }
    });

    // Count active games the player is in
    const activeGames = playerGames.filter(pg => pg.game.status === 'ACTIVE').length;

    // Get total clues across player's games (both available and forthcoming)
    const allClues = await this.prisma.gameClue.findMany({
      where: { gameId: { in: playerGameIds } },
      include: { game: true }
    });

    // Available clues (released already)
    const now = new Date();
    const availableClues = allClues.filter(clue => {
      if (!clue.releaseTime) return true; // If no release time, assume available
      const releaseTime = new Date(clue.releaseTime);
      return releaseTime <= now;
    });

    // Forthcoming clues (scheduled for future release)
    const forthcomingClues = allClues.filter(clue => {
      if (!clue.releaseTime) return false; // If no release time, not forthcoming
      const releaseTime = new Date(clue.releaseTime);
      return releaseTime > now;
    });

    // Count player's findings
    const totalFindings = await this.prisma.clueFinding.count({
      where: { 
        userId,
        gameClue: { gameId: { in: playerGameIds } }
      }
    });

    return {
      totalUsers: 0, // Not applicable for players
      totalPlayers: totalPlayersInMyGames, // Players across games they're playing
      activeUsers: 0, // Not applicable for players
      totalGames: playerGames.length,
      activeGames,
      totalClues: availableClues.length,
      availableClues: availableClues.length,
      forthcomingClues: forthcomingClues.length,
      totalFindings,
      recentActivity: [] // Could be populated with recent game activities
    };
  }
} 