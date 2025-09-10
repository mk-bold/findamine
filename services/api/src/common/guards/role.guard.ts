import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';

export enum Role {
  PLAYER = 'PLAYER',
  GAME_OWNER = 'GAME_OWNER',
  GAME_MANAGER = 'GAME_MANAGER',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role as Role;
    
    // Check if user has any of the required roles
    for (const role of requiredRoles) {
      if (await this.hasRole(userRole, role, user.id, params)) {
        return true;
      }
    }
    
    throw new ForbiddenException(
      `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, User has: ${userRole}`
    );
  }

  private async hasRole(userRole: Role, requiredRole: Role, userId: string, params: any): Promise<boolean> {
    const roleHierarchy: Record<Role, Role[]> = {
      [Role.ADMIN]: [Role.ADMIN, Role.GAME_MANAGER, Role.GAME_OWNER, Role.PLAYER],
      [Role.GAME_MANAGER]: [Role.GAME_MANAGER, Role.GAME_OWNER, Role.PLAYER],
      [Role.GAME_OWNER]: [Role.GAME_OWNER, Role.PLAYER],
      [Role.PLAYER]: [Role.PLAYER],
    };

    // Check basic role hierarchy first
    if (roleHierarchy[userRole]?.includes(requiredRole)) {
      return true;
    }

    // Special case: Check GAME_OWNER permission for PLAYER role
    if (userRole === Role.PLAYER && requiredRole === Role.GAME_OWNER) {
      return await this.isGameOwner(userId, params);
    }

    return false;
  }

  private async isGameOwner(userId: string, params: any): Promise<boolean> {
    // Extract game ID from various possible param names
    const gameId = params?.gameId || params?.id;
    
    if (!gameId) {
      return false;
    }

    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        select: { createdBy: true }
      });

      return game?.createdBy === userId;
    } catch (error) {
      console.error('Error checking game ownership:', error);
      return false;
    }
  }
} 