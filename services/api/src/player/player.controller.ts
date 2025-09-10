import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles, Role } from '../common/guards/role.guard';
import { PlayerService, 
  FindClueDto, 
  UpdateProfileDto, 
  UpdatePrivacyDto,
  CreateSocialConnectionDto,
  CreateReferralDto,
  UpdateProfileDataDto,
  SurveyResponseDto
} from './player.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('player')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  // ===== GAME PARTICIPATION =====
  
  @Get('games/available')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getAvailableGames(@Request() req: AuthenticatedRequest) {
    return this.playerService.getAvailableGames(req.user.id);
  }

  @Post('games/:gameId/join')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async joinGame(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    return this.playerService.joinGame(req.user.id, gameId);
  }

  @Put('games/:gameId/leave')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async leaveGame(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    return this.playerService.leaveGame(req.user.id, gameId);
  }

  @Get('games/my')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyGames(@Request() req: AuthenticatedRequest) {
    return this.playerService.getMyGames(req.user.id);
  }

  // ===== CLUE FINDING =====
  
  @Get('games/:gameId/clues')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getAvailableClues(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    return this.playerService.getAvailableClues(req.user.id, gameId);
  }

  @Post('games/:gameId/clues/find')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async findClue(
    @Request() req: AuthenticatedRequest, 
    @Param('gameId') gameId: string,
    @Body() findData: FindClueDto
  ) {
    return this.playerService.findClue(req.user.id, gameId, findData);
  }

  @Get('clues/findings')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyFindings(
    @Request() req: AuthenticatedRequest,
    @Query('gameId') gameId?: string
  ) {
    return this.playerService.getMyFindings(req.user.id, gameId);
  }

  // ===== PROFILE MANAGEMENT =====
  
  @Get('profile')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyProfile(@Request() req: AuthenticatedRequest) {
    return this.playerService.getMyProfile(req.user.id);
  }

  @Put('profile')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updateData: UpdateProfileDto) {
    return this.playerService.updateProfile(req.user.id, updateData);
  }

  @Put('profile/privacy')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async updatePrivacy(@Request() req: AuthenticatedRequest, @Body() privacyData: UpdatePrivacyDto) {
    return this.playerService.updatePrivacy(req.user.id, privacyData);
  }

  @Put('profile/data')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async updateProfileData(@Request() req: AuthenticatedRequest, @Body() updateData: UpdateProfileDataDto) {
    return this.playerService.updateProfileData(req.user.id, updateData);
  }

  // ===== SOCIAL FEATURES =====
  
  @Post('social/follow')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async followPlayer(@Request() req: AuthenticatedRequest, @Body() connectionData: CreateSocialConnectionDto) {
    return this.playerService.followPlayer(req.user.id, connectionData.followingId);
  }

  @Put('social/unfollow/:followingId')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async unfollowPlayer(@Request() req: AuthenticatedRequest, @Param('followingId') followingId: string) {
    return this.playerService.unfollowPlayer(req.user.id, followingId);
  }

  @Get('social/followers')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyFollowers(@Request() req: AuthenticatedRequest) {
    return this.playerService.getMyFollowers(req.user.id);
  }

  @Get('social/following')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyFollowing(@Request() req: AuthenticatedRequest) {
    return this.playerService.getMyFollowing(req.user.id);
  }

  @Get('minions')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMinions(@Request() req: AuthenticatedRequest) {
    return this.playerService.getMinions(req.user.id);
  }

  @Get('frenemies')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getFrenemies(@Request() req: AuthenticatedRequest) {
    return this.playerService.getFrenemies(req.user.id);
  }

  // ===== PLAYER SEARCH & MANAGEMENT =====
  
  @Get('search')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async searchPlayers(
    @Request() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('gameId') gameId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const parsedLimit = limit ? parseInt(limit) : 50;
    const parsedOffset = offset ? parseInt(offset) : 0;
    
    return this.playerService.searchPlayers(
      req.user.id,
      req.user.role as Role,
      search,
      gameId,
      parsedLimit,
      parsedOffset
    );
  }


  // ===== GAME MANAGER FEATURES =====






  @Post('social/refer')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async referPlayer(@Request() req: AuthenticatedRequest, @Body() referralData: CreateReferralDto) {
    return this.playerService.referPlayer(req.user.id, referralData);
  }

  // ===== LEADERBOARDS =====
  
  @Get('leaderboard/game/:gameId')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getGameLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit: string = '50'
  ) {
    return this.playerService.getGameLeaderboard(gameId, parseInt(limit));
  }

  @Get('leaderboard/global')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getGlobalLeaderboard(@Query('limit') limit: string = '100') {
    return this.playerService.getGlobalLeaderboard(parseInt(limit));
  }

  // ===== PLAYER STATISTICS =====
  
  @Get('stats')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getPlayerStats(@Request() req: AuthenticatedRequest) {
    console.log('📊 PlayerController: getPlayerStats called for user:', req.user.id);
    return this.playerService.getPlayerStats(req.user.id);
  }

  // ===== GAME STATISTICS =====
  
  @Get('games/:gameId/stats')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyGameStats(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    // Get player's game participation
    const participation = await this.playerService.getMyGames(req.user.id);
    const gameParticipation = participation.find(p => p.game.id === gameId);
    
    if (!gameParticipation) {
      return { error: 'Not participating in this game' };
    }

    // Get clues found in this game
    const findings = await this.playerService.getMyFindings(req.user.id, gameId);
    
    // Get leaderboard position
    const leaderboard = await this.playerService.getGameLeaderboard(gameId, 1000);
    const playerRank = leaderboard.findIndex(p => p.userId === req.user.id) + 1;

    return {
      game: gameParticipation.game,
      participation: {
        joinedAt: gameParticipation.joinedAt,
        totalPoints: gameParticipation.totalPoints,
        privacyLevel: gameParticipation.privacyLevel
      },
      progress: {
        cluesFound: findings.length,
        totalClues: findings.length, // This should be updated to get total available clues
        rank: playerRank > 0 ? playerRank : 'Unranked'
      },
      findings: findings.map(f => ({
        clueName: f.gameClue.clueLocation.identifyingName,
        foundAt: f.foundAt,
        points: f.points
      }))
    };
  }

  // ===== SURVEY PARTICIPATION =====
  
  @Post('games/:gameId/surveys/:surveyId/respond')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async respondToSurvey(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Param('surveyId') surveyId: string,
    @Body() responses: SurveyResponseDto[]
  ) {
    // This would integrate with the survey system
    // For now, return a placeholder response
    return {
      message: 'Survey responses recorded',
      gameId,
      surveyId,
      responsesCount: responses.length,
      userId: req.user.id
    };
  }

  // ===== TEAM FEATURES =====
  
  @Get('teams')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyTeams(@Request() req: AuthenticatedRequest) {
    // This would integrate with the team system
    // For now, return a placeholder response
    return {
      message: 'Team features coming soon',
      userId: req.user.id,
      teams: []
    };
  }

  // ===== ACHIEVEMENTS & BADGES =====
  
  @Get('achievements')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyAchievements(@Request() req: AuthenticatedRequest) {
    // This would integrate with the badge/achievement system
    // For now, return a placeholder response
    return {
      message: 'Achievement system coming soon',
      userId: req.user.id,
      achievements: [],
      badges: []
    };
  }

  // ===== NOTIFICATIONS =====
  
  @Get('notifications')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getMyNotifications(@Request() req: AuthenticatedRequest) {
    // This would integrate with a notification system
    // For now, return a placeholder response
    return {
      message: 'Notification system coming soon',
      userId: req.user.id,
      notifications: []
    };
  }

} 