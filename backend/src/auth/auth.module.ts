import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyGuard } from './api-key.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ApiKeyGuard,
    JwtAuthGuard,
    PrismaService,
  ],
  exports: [AuthService, ApiKeyGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
