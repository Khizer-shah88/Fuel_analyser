import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
    getTimeSeriesData(pumpId?: string, hours?: string): Promise<{
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
