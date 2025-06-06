import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if ( !user ) throw new ForbiddenException('Access denied: User not found');    
    
    if ( !user.roles.includes('Admin') ) throw new ForbiddenException('Access denied: Admins only');

    return true;
  }
}
