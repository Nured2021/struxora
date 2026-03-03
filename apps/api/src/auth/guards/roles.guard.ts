import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService, UserWithMemberships } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: { sub: string } }>();
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.usersService.findByIdWithMemberships(userId);
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    const userRoles = new Set(user.memberships.map((m) => m.role));
    const hasRole = requiredRoles.some((r) => userRoles.has(r));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    (request as { userWithMemberships?: UserWithMemberships }).userWithMemberships = user;
    return true;
  }
}
