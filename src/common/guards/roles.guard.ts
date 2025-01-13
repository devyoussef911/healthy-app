import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // Log required roles for debugging
    this.logger.log(`Required Roles: ${requiredRoles}`);

    if (!requiredRoles) {
      return true; // Allow access if no roles are required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Log user object for debugging
    this.logger.log(`User: ${JSON.stringify(user)}`);

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
