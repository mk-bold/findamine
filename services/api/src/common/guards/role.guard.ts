import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
  PLAYER = 'PLAYER',
  GAME_MASTER = 'GAME_MASTER',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role as Role;
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => this.hasRole(userRole, role));
    
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, User has: ${userRole}`
      );
    }

    return true;
  }

  private hasRole(userRole: Role, requiredRole: Role): boolean {
    const roleHierarchy = {
      [Role.ADMIN]: [Role.ADMIN, Role.GAME_MASTER, Role.PLAYER],
      [Role.GAME_MASTER]: [Role.GAME_MASTER, Role.PLAYER],
      [Role.PLAYER]: [Role.PLAYER],
    };

    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  }
} 