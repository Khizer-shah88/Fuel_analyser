import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    validateApiKey(apiKey: string): Promise<boolean>;
    getPumpByApiKey(apiKey: string): Promise<{
        id: string;
        createdAt: Date;
        pumpId: string;
        apiKey: string;
        stationId: string;
        updatedAt: Date;
    } | null>;
}
