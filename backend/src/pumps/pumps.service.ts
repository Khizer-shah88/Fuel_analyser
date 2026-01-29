import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';

@Injectable()
export class PumpsService {
  constructor(private prisma: PrismaService) {}

  async createPumpData(createPumpDataDto: CreatePumpDataDto) {
    // Verify pump exists
    const pump = await this.prisma.pump.findUnique({
      where: { pumpId: createPumpDataDto.pumpId },
    });

    if (!pump) {
      throw new NotFoundException(
        `Pump with ID ${createPumpDataDto.pumpId} not found`,
      );
    }

    // API KEY validation
    if (pump.apiKey !== createPumpDataDto.apiKey) {
      throw new BadRequestException('Invalid API Key');
    }

    // Parse timestamp
    const timestamp = new Date(createPumpDataDto.timestamp);

    // Validate data
    if (createPumpDataDto.liters < 0 || createPumpDataDto.amount < 0) {
      throw new BadRequestException('Liters and amount must be non-negative');
    }

    if (createPumpDataDto.nozzle < 1) {
      throw new BadRequestException('Nozzle number must be at least 1');
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
          take: 1, // Latest transaction only
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPumpById(pumpId: string) {
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
          take: 10, // Last 10 transactions
        },
      },
    });

    if (!pump) {
      throw new NotFoundException(`Pump with ID ${pumpId} not found`);
    }

    return pump;
  }

  async getPumpData(pumpId: string, limit: number = 100) {
    // Verify pump exists
    const pump = await this.prisma.pump.findUnique({
      where: { pumpId },
    });

    if (!pump) {
      throw new NotFoundException(`Pump with ID ${pumpId} not found`);
    }

    return this.prisma.pumpData.findMany({
      where: { pumpId },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}
