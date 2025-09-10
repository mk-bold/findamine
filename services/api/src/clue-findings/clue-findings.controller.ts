import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClueFindingsService } from './clue-findings.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ClueFindingsController {
  constructor(private clueFindingsService: ClueFindingsService) {}

  @Get('clue-locations/:id')
  async getClueLocationById(@Param('id') id: string) {
    return this.clueFindingsService.getClueLocationById(id);
  }

  @Get('clue-findings/by-game-clue')
  async getClueFindingsByGameClue(
    @Query('gameId') gameId: string,
    @Query('clueLocationId') clueLocationId: string
  ) {
    return this.clueFindingsService.getClueFindingsByGameClue(gameId, clueLocationId);
  }

  @Get('clue-findings/by-clue-location/:clueLocationId')
  async getClueFindingsByClueLocation(
    @Param('clueLocationId') clueLocationId: string,
    @Query('excludeGameId') excludeGameId?: string,
    @Query('since') since?: string
  ) {
    const sinceDate = since ? new Date(since) : undefined;
    return this.clueFindingsService.getClueFindingsByClueLocation(
      clueLocationId, 
      excludeGameId, 
      sinceDate
    );
  }
}