import { PrismaService } from '../common/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    } | null>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
    } | null>;
    create(email: string, password: string, role?: string): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
    update(id: string, data: {
        email?: string;
        role?: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
    }>;
}
