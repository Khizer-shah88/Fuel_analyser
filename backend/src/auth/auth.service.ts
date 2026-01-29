import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
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
    const pump = await this.prisma.pump.findFirst({
      where: { apiKey },
    });
    return !!pump;
  }

  async getPumpByApiKey(apiKey: string) {
    return this.prisma.pump.findFirst({
      where: { apiKey },
    });
  }
}
