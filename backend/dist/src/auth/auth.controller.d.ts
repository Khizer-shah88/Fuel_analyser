import { AuthService } from './auth.service';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): {
        userId: any;
        email: any;
        role: any;
    };
}
