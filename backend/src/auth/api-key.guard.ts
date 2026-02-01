import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException(
        'API key is required. Please provide x-api-key header.',
      );
    }

    const pump = await this.authService.getPumpByApiKey(apiKey);

    if (!pump) {
      throw new UnauthorizedException(
        'Invalid API key. Pump not found or API key is incorrect.',
      );
    }

    // Attach pump information to request for use in controllers
    request.pump = pump;
    request.apiKey = apiKey;

    return true;
  }
}
