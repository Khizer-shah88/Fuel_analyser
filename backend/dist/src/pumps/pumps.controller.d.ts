import { PumpsService } from './pumps.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
export declare class PumpsController {
    private readonly pumpsService;
    constructor(pumpsService: PumpsService);
    create(createPumpDataDto: CreatePumpDataDto): Promise<{
        id: string;
        createdAt: Date;
        pumpId: string;
        liters: number;
        amount: number;
        nozzle: number;
        fuelType: string;
        timestamp: Date;
    }>;
    findAll(): Promise<({
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
    findOne(pumpId: string): Promise<{
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
    getPumpData(pumpId: string, limit?: string): Promise<{
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
