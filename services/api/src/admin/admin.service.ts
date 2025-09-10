import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, Prisma } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async promoteUser(id: string, newRole: UserRole) {
    // Only allow promoting to GAME_MANAGER or ADMIN
    if (newRole === 'PLAYER') {
      throw new ForbiddenException('Cannot demote user to PLAYER role');
    }

    return this.updateUser(id, { role: newRole });
  }

  async deactivateUser(id: string) {
    return this.updateUser(id, { isActive: false });
  }

  async activateUser(id: string) {
    return this.updateUser(id, { isActive: true });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by deactivating
    return this.deactivateUser(id);
  }

  async getSystemStats() {
    const [totalUsers, totalPlayers, activeUsers, totalGames, activeGames, totalClues, totalFindings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PLAYER' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.game.count(),
      this.prisma.game.count({ where: { status: 'ACTIVE' } }),
      this.prisma.gameClue.count(),
      this.prisma.clueFinding.count()
    ]);

    return {
      totalUsers,
      totalPlayers,
      activeUsers,
      totalGames,
      activeGames,
      totalClues,
      totalFindings,
      recentActivity: [] // Could be populated with recent user registrations, game creations, etc.
    };
  }
} 