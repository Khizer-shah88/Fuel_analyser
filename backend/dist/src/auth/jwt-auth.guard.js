"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        console.log('JwtAuthGuard - canActivate called');
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        console.log('JwtAuthGuard - auth header:', authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('JwtAuthGuard - invalid auth header');
            throw new common_1.UnauthorizedException('Invalid authorization header');
        }
        const token = authHeader.substring(7);
        console.log('JwtAuthGuard - extracted token length:', token.length);
        try {
            console.log('JwtAuthGuard - verifying token...');
            const payload = this.jwtService.verify(token);
            console.log('JwtAuthGuard - token verified, payload:', payload);
            request.user = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
            };
            console.log('JwtAuthGuard - user set on request');
            return true;
        }
        catch (error) {
            console.error('JwtAuthGuard - token verification failed:', error.message);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map