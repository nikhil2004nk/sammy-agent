import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// In a real app this should come from ConfigService
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'super-secret-key-for-development-only',
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating payload:', payload);
    if (!payload || !payload.sub) {
      console.error('[JwtStrategy] Invalid payload structure');
      return null;
    }
    return { userId: payload.sub };
  }
}
