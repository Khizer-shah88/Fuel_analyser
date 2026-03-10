import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // DEBUG: Log all incoming headers
    this.logger.debug('🔍 [API Key Guard] Incoming headers:');
    this.logger.debug(JSON.stringify(request.headers, null, 2));
    
    // Extract API key from x-api-key header
    const apiKey = request.headers['x-api-key'];
    
    this.logger.debug(`📋 [API Key Guard] Extracted API Key: ${apiKey ? 'Present' : 'Missing'}`);
    if (apiKey) {
      this.logger.debug(`   Key length: ${apiKey.length}`);
      this.logger.debug(`   Key preview: ${apiKey.substring(0, 16)}...${apiKey.substring(apiKey.length - 8)}`);
    }

    // Validate API key exists and is a string
    if (!apiKey || typeof apiKey !== 'string') {
      this.logger.error('❌ [API Key Guard] Validation failed: API key is missing or not a string');
      throw new UnauthorizedException({
        error: 'Invalid authorization header',
        message: 'API key is required. Please provide x-api-key header.',
        details: {
          headerReceived: !!apiKey,
          headerType: typeof apiKey,
          expectedFormat: 'x-api-key:17db77a23ddb33979a5a712455744aa5658bcf1414eb41e10c3e5acd133e36f4',
        },
      });
    }

    // Look up pump by API key
    this.logger.debug('🔍 [API Key Guard] Looking up pump in database...');
    const pump = await this.authService.getPumpByApiKey(apiKey);

    if (!pump) {
      this.logger.error(`❌ [API Key Guard] Pump not found for API key: ${apiKey.substring(0, 16)}...`);
      throw new UnauthorizedException({
        error: 'Invalid authorization header',
        message: 'Invalid API key. Pump not found or API key is incorrect.',
        details: {
          apiKeyProvided: apiKey.substring(0, 16) + '...',
          suggestion: 'Verify the API key was correctly returned during pump registration.',
        },
      });
    }

    // Log successful authentication
    this.logger.log(`✅ [API Key Guard] Authentication successful for pump: ${pump.pumpId}`);
    this.logger.debug(`   Pump ID: ${pump.pumpId}`);
    this.logger.debug(`   Station ID: ${pump.stationId || 'None'}`);
    this.logger.debug(`   API Key ID (first 16 chars): ${pump.apiKey.substring(0, 16)}...`);

    // Attach pump information to request for use in controllers
    request.pump = pump;
    request.apiKey = apiKey;

    return true;
  }
}


