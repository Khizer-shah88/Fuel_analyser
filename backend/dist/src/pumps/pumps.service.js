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
exports.PumpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
let PumpsService = class PumpsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPumpData(createPumpDataDto) {
        const pump = await this.prisma.pump.findUnique({
            where: { pumpId: createPumpDataDto.pumpId },
        });
        if (!pump) {
            throw new common_1.NotFoundException(`Pump with ID ${createPumpDataDto.pumpId} not found`);
        }
        if (pump.apiKey !== createPumpDataDto.apiKey) {
            throw new common_1.BadRequestException('Invalid API Key');
        }
        const timestamp = new Date(createPumpDataDto.timestamp);
        if (createPumpDataDto.liters < 0 || createPumpDataDto.amount < 0) {
            throw new common_1.BadRequestException('Liters and amount must be non-negative');
        }
        if (createPumpDataDto.nozzle < 1) {
            throw new common_1.BadRequestException('Nozzle number must be at least 1');
        }
        return this.prisma.pumpData.create({
            data: {
                pumpId: createPumpDataDto.pumpId,
                liters: createPumpDataDto.liters,
                amount: createPumpDataDto.amount,
                nozzle: createPumpDataDto.nozzle,
                fuelType: createPumpDataDto.fuelType,
                timestamp: timestamp,
            },
        });
    }
    async getAllPumps() {
        return this.prisma.pump.findMany({
            include: {
                station: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
                data: {
                    orderBy: {
                        timestamp: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getPumpById(pumpId) {
        const pump = await this.prisma.pump.findUnique({
            where: { pumpId },
            include: {
                station: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        owner: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                data: {
                    orderBy: {
                        timestamp: 'desc',
                    },
                    take: 10,
                },
            },
        });
        if (!pump) {
            throw new common_1.NotFoundException(`Pump with ID ${pumpId} not found`);
        }
        return pump;
    }
    async getPumpData(pumpId, limit = 100) {
        const pump = await this.prisma.pump.findUnique({
            where: { pumpId },
        });
        if (!pump) {
            throw new common_1.NotFoundException(`Pump with ID ${pumpId} not found`);
        }
        return this.prisma.pumpData.findMany({
            where: { pumpId },
            orderBy: {
                timestamp: 'desc',
            },
            take: limit,
        });
    }
};
exports.PumpsService = PumpsService;
exports.PumpsService = PumpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PumpsService);
//# sourceMappingURL=pumps.service.js.map