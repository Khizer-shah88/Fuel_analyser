import { PrismaService } from '../common/prisma.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
export declare class PumpsService {
    private prisma;
    constructor(prisma: PrismaService);
    createPumpData(createPumpDataDto: CreatePumpDataDto): Promise<{
        id: string;
        createdAt: Date;
        pumpId: string;
        liters: number;
        amount: number;
        nozzle: number;
        fuelType: string;
        timestamp: Date;
    }>;
    getAllPumps(): Promise<({
        station: {
            id: string;
            name: string;
            location: string | null;
        };
        data: {
            id: string;
            createdAt: Date;
            pumpId: string;
            liters: number;
            amount: number;
            nozzle: number;
            fuelType: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        pumpId: string;
        apiKey: string;
        stationId: string;
        updatedAt: Date;
    })[]>;
    getPumpById(pumpId: string): Promise<{
        station: {
            id: string;
            name: string;
            location: string | null;
            owner: {
                id: string;
                email: string;
            };
        };
        data: {
            id: string;
            createdAt: Date;
            pumpId: string;
            liters: number;
            amount: number;
            nozzle: number;
            fuelType: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        pumpId: string;
        apiKey: string;
        stationId: string;
        updatedAt: Date;
    }>;
    getPumpData(pumpId: string, limit?: number): Promise<{
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
