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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLitersStatistics(pumpId) {
        const where = pumpId ? { pumpId } : {};
        const data = await this.prisma.pumpData.findMany({
            where,
            orderBy: {
                timestamp: 'desc',
            },
        });
        if (data.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                total: 0,
                count: 0,
            };
        }
        const liters = data.map((d) => d.liters);
        const sum = liters.reduce((a, b) => a + b, 0);
        const average = sum / liters.length;
        const min = Math.min(...liters);
        const max = Math.max(...liters);
        return {
            average: parseFloat(average.toFixed(2)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            total: parseFloat(sum.toFixed(2)),
            count: data.length,
        };
    }
    async getAmountStatistics(pumpId) {
        const where = pumpId ? { pumpId } : {};
        const data = await this.prisma.pumpData.findMany({
            where,
            orderBy: {
                timestamp: 'desc',
            },
        });
        if (data.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                total: 0,
                count: 0,
            };
        }
        const amounts = data.map((d) => d.amount);
        const sum = amounts.reduce((a, b) => a + b, 0);
        const average = sum / amounts.length;
        const min = Math.min(...amounts);
        const max = Math.max(...amounts);
        return {
            average: parseFloat(average.toFixed(2)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            total: parseFloat(sum.toFixed(2)),
            count: data.length,
        };
    }
    async getFuelTypeDistribution(pumpId) {
        const where = pumpId ? { pumpId } : {};
        const data = await this.prisma.pumpData.findMany({
            where,
        });
        const distribution = data.reduce((acc, item) => {
            acc[item.fuelType] = (acc[item.fuelType] || 0) + 1;
            return acc;
        }, {});
        return distribution;
    }
    async getNozzleDistribution(pumpId) {
        const where = pumpId ? { pumpId } : {};
        const data = await this.prisma.pumpData.findMany({
            where,
        });
        const distribution = data.reduce((acc, item) => {
            acc[item.nozzle] = (acc[item.nozzle] || 0) + 1;
            return acc;
        }, {});
        return distribution;
    }
    async getTimeSeriesData(pumpId, hours = 24) {
        const where = pumpId ? { pumpId } : {};
        const since = new Date();
        since.setHours(since.getHours() - hours);
        return this.prisma.pumpData.findMany({
            where: {
                ...where,
                timestamp: {
                    gte: since,
                },
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map