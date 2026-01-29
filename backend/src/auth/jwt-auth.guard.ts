import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('JwtAuthGuard - canActivate called');

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('JwtAuthGuard - auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JwtAuthGuard - invalid auth header');
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.substring(7);
    console.log('JwtAuthGuard - extracted token length:', token.length);

    try {
      console.log('JwtAuthGuard - verifying token...');
      // IMPORTANT: do not override the secret here.
      // Use the same JwtService configuration as the one used to sign tokens.
      const payload = this.jwtService.verify(token);

      console.log('JwtAuthGuard - token verified, payload:', payload);

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      console.log('JwtAuthGuard - user set on request');
      return true;
    } catch (error) {
      console.error('JwtAuthGuard - token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
