import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles, Role } from '../common/guards/role.guard';
import { GameMasterService, 
  CreateGameDto, 
  UpdateGameDto, 
  CreateClueLocationDto, 
  UpdateClueLocationDto,
  CreateGameClueDto,
  UpdateGameClueDto,
  CreatePrizeDto,
  CreateSurveyDto,
  CreateTeamDto,
  CreateTreatmentDto,
  CreateGameTreatmentDto,
  AddPlayerDto,
  BatchAddPlayersDto
} from './game-master.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('game-master')
@UseGuards(JwtAuthGuard, RoleGuard)
export class GameMasterController {
  constructor(private gameMasterService: GameMasterService) {}

  // ===== GAME MANAGEMENT =====
  
  @Post('games')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async createGame(@Request() req: AuthenticatedRequest, @Body() gameData: CreateGameDto) {
    return this.gameMasterService.createGame(req.user.id, gameData);
  }

  @Get('games')
  @Roles(Role.PLAYER, Role.GAME_MANAGER, Role.ADMIN)
  async getGames(@Request() req: AuthenticatedRequest, @Query('status') status?: string) {
    return this.gameMasterService.getGames(req.user.id, req.user.role as any, status as any);
  }

  @Get('games/:id')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async getGameById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.gameMasterService.getGameById(id, req.user.id);
  }

  @Put('games/:id')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async updateGame(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateData: UpdateGameDto) {
    return this.gameMasterService.updateGame(id, req.user.id, updateData);
  }

  @Delete('games/:id')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async deleteGame(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.gameMasterService.deleteGame(id, req.user.id);
  }

  @Get('games/:id/stats')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async getGameStats(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.gameMasterService.getGameStats(id, req.user.id);
  }

  @Post('games/validate-code')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async validateGameCode(@Request() req: AuthenticatedRequest, @Body() body: { gameCode: string; excludeGameId?: string }) {
    const { gameCode, excludeGameId } = body;
    const isAvailable = await this.gameMasterService.validateGameCode(gameCode, excludeGameId);
    return { isAvailable };
  }

  @Get('clue-locations/:clueLocationId/game-count')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async getClueLocationGameCount(@Request() req: AuthenticatedRequest, @Param('clueLocationId') clueLocationId: string) {
    return this.gameMasterService.getClueLocationGameCount(req.user.id, clueLocationId);
  }

  // ===== CLUE LOCATION MANAGEMENT =====
  
  @Post('clue-locations')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async createClueLocation(@Body() locationData: CreateClueLocationDto) {
    return this.gameMasterService.createClueLocation(locationData);
  }

  @Get('clue-locations')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async getClueLocations(
    @Query('search') search?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string
  ) {
    return this.gameMasterService.getClueLocations(
      search,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radius ? parseFloat(radius) : undefined
    );
  }

  @Get('clue-locations/:id')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async getClueLocationById(@Param('id') id: string) {
    return this.gameMasterService.getClueLocationById(id);
  }

  @Put('clue-locations/:id')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async updateClueLocation(@Param('id') id: string, @Body() updateData: UpdateClueLocationDto) {
    return this.gameMasterService.updateClueLocation(id, updateData);
  }

  // ===== GAME CLUE MANAGEMENT =====
  
  @Post('games/:gameId/clues')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async addClueToGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() clueData: CreateGameClueDto
  ) {
    return this.gameMasterService.addClueToGame(gameId, req.user.id, clueData);
  }

  @Get('games/:gameId/clues')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async getGameClues(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    return this.gameMasterService.getGameClues(gameId, req.user.id);
  }

  @Put('games/:gameId/clues/:clueId')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async updateGameClue(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Param('clueId') clueId: string,
    @Body() updateData: UpdateGameClueDto
  ) {
    return this.gameMasterService.updateGameClue(gameId, clueId, req.user.id, updateData);
  }

  @Delete('games/:gameId/clues/:clueId')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async removeClueFromGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Param('clueId') clueId: string
  ) {
    return this.gameMasterService.removeClueFromGame(gameId, clueId, req.user.id);
  }

  // ===== PRIZE MANAGEMENT =====
  
  @Post('games/:gameId/prizes')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async createPrize(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() prizeData: CreatePrizeDto
  ) {
    return this.gameMasterService.createPrize(gameId, req.user.id, prizeData);
  }

  @Get('games/:gameId/prizes')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async getGamePrizes(@Request() req: AuthenticatedRequest, @Param('gameId') gameId: string) {
    return this.gameMasterService.getGamePrizes(gameId, req.user.id);
  }

  // ===== SURVEY MANAGEMENT =====
  
  @Post('surveys')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async createSurvey(@Body() surveyData: CreateSurveyDto) {
    return this.gameMasterService.createSurvey(surveyData);
  }

  @Post('games/:gameId/surveys')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async assignSurveyToGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() data: { surveyId: string; points?: number }
  ) {
    return this.gameMasterService.assignSurveyToGame(gameId, req.user.id, data.surveyId, data.points);
  }

  // ===== TEAM MANAGEMENT =====
  
  @Post('games/:gameId/teams')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async createTeam(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() teamData: CreateTeamDto
  ) {
    return this.gameMasterService.createTeam(gameId, req.user.id, teamData);
  }

  // ===== TREATMENT MANAGEMENT =====
  
  @Post('treatments')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async createTreatment(@Body() treatmentData: CreateTreatmentDto) {
    return this.gameMasterService.createTreatment(treatmentData);
  }

  @Post('games/:gameId/treatments')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async assignTreatmentToGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() treatmentData: CreateGameTreatmentDto
  ) {
    return this.gameMasterService.assignTreatmentToGame(gameId, req.user.id, treatmentData);
  }

  // ===== PLAYER MANAGEMENT =====
  
  @Post('games/:gameId/players')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async addPlayerToGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() playerData: AddPlayerDto
  ) {
    return this.gameMasterService.addPlayerToGame(gameId, req.user.id, playerData);
  }

  @Post('games/:gameId/players/batch')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async batchAddPlayersToGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Body() batchData: BatchAddPlayersDto
  ) {
    return this.gameMasterService.batchAddPlayersToGame(gameId, req.user.id, batchData);
  }

  @Put('games/:gameId/players/:userId/remove')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async removePlayerFromGame(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Param('userId') userId: string
  ) {
    return this.gameMasterService.removePlayerFromGame(gameId, req.user.id, userId);
  }

  // ===== CHAT MODERATION =====
  
  @Delete('games/:gameId/chat/:postId')
  @Roles(Role.GAME_OWNER, Role.GAME_MANAGER, Role.ADMIN)
  async deleteChatPost(
    @Request() req: AuthenticatedRequest,
    @Param('gameId') gameId: string,
    @Param('postId') postId: string
  ) {
    return this.gameMasterService.deleteChatPost(gameId, req.user.id, postId);
  }

  // ===== LEGACY ENDPOINTS (for backward compatibility) =====
  
  @Get('stats')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async getGameMasterStats(@Request() req: AuthenticatedRequest) {
    console.log('🎮 GameMasterController: getGameMasterStats called for user:', req.user.id, 'role:', req.user.role);
    return this.gameMasterService.getGameMasterStats(req.user.id);
  }

  @Get('features')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async getAccessibleFeatures(@Request() req: AuthenticatedRequest) {
    return {
      gameMasterFeatures: [
        'Create new games',
        'Manage game locations',
        'Create and edit clues',
        'View player leaderboards',
        'Schedule clue releases',
        'Manage prizes and surveys',
        'Create teams and treatments',
        'Moderate chat posts'
      ],
      inheritedPlayerFeatures: [
        'Participate in games',
        'Find clues',
        'Earn points',
        'View own progress',
        'Connect with other players'
      ]
    };
  }

  @Get('demo-hierarchy')
  @Roles(Role.GAME_MANAGER, Role.ADMIN)
  async demonstrateHierarchy(@Request() req: AuthenticatedRequest) {
    return {
      message: 'This endpoint demonstrates hierarchical role access!',
      userRole: req.user.role,
      explanation: {
        ADMIN: 'Can access ADMIN + GAME_MANAGER + PLAYER endpoints',
        GAME_MANAGER: 'Can access GAME_MANAGER + PLAYER endpoints',
        PLAYER: 'Can only access PLAYER endpoints'
      },
      currentAccess: req.user.role === 'ADMIN'
        ? 'Full access to everything (inherits all permissions)'
        : req.user.role === 'GAME_MANAGER'
        ? 'Access to game master and player features'
        : 'Access to player features only'
    };
  }
} 