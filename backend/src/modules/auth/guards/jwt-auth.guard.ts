import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      console.error('[JwtAuthGuard] Failed to authenticate:', {
        url: context.switchToHttp().getRequest().url,
        err,
        info: info?.message || info,
        headers: context.switchToHttp().getRequest().headers
      });
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
