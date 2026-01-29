import { PrismaService } from '../common/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getLitersStatistics(pumpId?: string): Promise<{
        average: number;
        min: number;
        max: number;
        total: number;
        count: number;
    }>;
    getAmountStatistics(pumpId?: string): Promise<{
        average: number;
        min: number;
        max: number;
        total: number;
        count: number;
    }>;
    getFuelTypeDistribution(pumpId?: string): Promise<Record<string, number>>;
    getNozzleDistribution(pumpId?: string): Promise<Record<number, number>>;
    getTimeSeriesData(pumpId?: string, hours?: number): Promise<{
        id: string;
        createdAt: Date;
        pumpId: string;
        liters: number;
        amount: number;
        nozzle: number;
        fuelType: string;
        timestamp: Date;
    }[]>;
}
