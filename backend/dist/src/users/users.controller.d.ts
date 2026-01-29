import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: {
        email: string;
        password: string;
        role?: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
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
    update(id: string, updateUserDto: {
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
