import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClueFindingsService {
  constructor(private prisma: PrismaService) {}

  async getClueLocationById(id: string) {
    const clueLocation = await this.prisma.clueLocation.findUnique({
      where: { id }
    });

    if (!clueLocation) {
      throw new NotFoundException('Clue location not found');
    }

    return clueLocation;
  }

  async getClueFindingsByGameClue(gameId: string, clueLocationId: string) {
    const findings = await this.prisma.clueFinding.findMany({
      where: {
        gameClue: {
          gameId: gameId,
          clueLocationId: clueLocationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        gameClue: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true
              }
            },
            clueLocation: {
              select: {
                id: true,
                identifyingName: true,
                anonymizedName: true,
                text: true,
                hint: true,
                latitude: true,
                longitude: true
              }
            }
          }
        }
      },
      orderBy: {
        foundAt: 'desc'
      }
    });

    return findings;
  }

  async getClueFindingsByClueLocation(
    clueLocationId: string, 
    excludeGameId?: string, 
    since?: Date
  ) {
    const where: any = {
      gameClue: {
        clueLocationId: clueLocationId
      }
    };

    if (excludeGameId) {
      where.gameClue.gameId = {
        not: excludeGameId
      };
    }

    if (since) {
      where.foundAt = {
        gte: since
      };
    }

    const findings = await this.prisma.clueFinding.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            gamerTag: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        gameClue: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true
              }
            },
            clueLocation: {
              select: {
                id: true,
                identifyingName: true,
                anonymizedName: true,
                text: true,
                hint: true,
                latitude: true,
                longitude: true
              }
            }
          }
        }
      },
      orderBy: {
        foundAt: 'desc'
      }
    });

    return findings;
  }
}