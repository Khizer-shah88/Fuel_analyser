import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({
      email: user.email,
      sub: user.id,
      role: user.role,
    });

    return {
      access_token: token,
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    this.logger.debug(`🔐 [AuthService] Validating API key: ${apiKey.substring(0, 16)}...`);
    const pump = await this.prisma.pump.findFirst({
      where: { apiKey },
    });
    
    if (pump) {
      this.logger.debug(`✅ [AuthService] API key valid - pump found: ${pump.pumpId}`);
    } else {
      this.logger.warn(`❌ [AuthService] API key invalid - no pump found`);
    }
    
    return !!pump;
  }

  async getPumpByApiKey(apiKey: string) {
    this.logger.debug(`🔍 [AuthService] Looking up pump by API key: ${apiKey.substring(0, 16)}...`);
    this.logger.debug(`   Full key length: ${apiKey.length} characters`);
    
    try {
      const pump = await this.prisma.pump.findFirst({
        where: { apiKey },
      });
      
      if (pump) {
        this.logger.log(`✅ [AuthService] Pump found: ${pump.pumpId}`);
        this.logger.debug(`   Stored API key length: ${pump.apiKey.length}`);
        this.logger.debug(`   Stored API key matches: ${pump.apiKey === apiKey}`);
      } else {
        this.logger.error(`❌ [AuthService] No pump found with API key: ${apiKey.substring(0, 16)}...`);
        
        // Debug: Check if ANY pumps exist
        const allPumps = await this.prisma.pump.findMany();
        this.logger.debug(`   Total pumps in database: ${allPumps.length}`);
        if (allPumps.length > 0) {
          this.logger.debug(`   Existing pumps:`);
          allPumps.forEach(p => {
            this.logger.debug(`     - ${p.pumpId}: API Key ${p.apiKey.substring(0, 16)}...`);
          });
        }
      }
      
      return pump;
    } catch (error) {
      this.logger.error(`❌ [AuthService] Database error during pump lookup:`, error.message);
      throw error;
    }
  }
}
