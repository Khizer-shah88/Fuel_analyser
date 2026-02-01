import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
import { RegisterPumpDto } from './dto/register-pump.dto';

@Injectable()
export class PumpsService {
  constructor(private prisma: PrismaService) {}

  async createPumpData(
    createPumpDataDto: CreatePumpDataDto,
    apiKey: string,
  ) {
    // Find pump by API key (already validated by ApiKeyGuard)
    const pump = await this.prisma.pump.findFirst({
      where: { apiKey },
    });

    if (!pump) {
      throw new UnauthorizedException(
        'Pump not found for the provided API key. Please register the pump first.',
      );
    }

    // Validate that pumpId in request body matches the pump associated with the API key
    if (pump.pumpId !== createPumpDataDto.pumpId) {
      throw new BadRequestException(
        `Pump ID mismatch. The API key belongs to pump '${pump.pumpId}', but the request specifies '${createPumpDataDto.pumpId}'.`,
      );
    }

    // Validate stationId if provided
    if (
      createPumpDataDto.stationId &&
      pump.stationId !== createPumpDataDto.stationId
    ) {
      throw new BadRequestException(
        `Station ID mismatch. The pump belongs to station '${pump.stationId}', but the request specifies '${createPumpDataDto.stationId}'.`,
      );
    }

    // Parse and validate timestamp
    const timestamp = new Date(createPumpDataDto.timestamp);
    if (isNaN(timestamp.getTime())) {
      throw new BadRequestException('Invalid timestamp format');
    }

    // Validate future timestamps (allow small buffer for clock drift)
    const now = new Date();
    const maxFutureTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
    if (timestamp > maxFutureTime) {
      throw new BadRequestException(
        'Timestamp cannot be more than 5 minutes in the future',
      );
    }

    // Validate data ranges
    if (createPumpDataDto.liters < 0) {
      throw new BadRequestException('Liters must be non-negative');
    }

    if (createPumpDataDto.amount < 0) {
      throw new BadRequestException('Amount must be non-negative');
    }

    if (createPumpDataDto.nozzle < 1 || createPumpDataDto.nozzle > 10) {
      throw new BadRequestException('Nozzle number must be between 1 and 10');
    }

    // Create pump data record
    return this.prisma.pumpData.create({
      data: {
        pumpId: pump.pumpId,
        liters: createPumpDataDto.liters,
        amount: createPumpDataDto.amount,
        nozzle: createPumpDataDto.nozzle,
        fuelType: createPumpDataDto.fuelType,
        timestamp: timestamp,
      },
    });
  }

  async registerPump(registerPumpDto: RegisterPumpDto) {
    const { pumpId, stationId } = registerPumpDto;

    // Check if pump already exists
    const existingPump = await this.prisma.pump.findUnique({
      where: { pumpId },
    });

    if (existingPump) {
      return {
        success: true,
        message: 'Pump already registered',
        pumpId: existingPump.pumpId,
        apiKey: existingPump.apiKey,
        registered: false,
      };
    }

    // Validate stationId if provided
    if (stationId) {
      const station = await this.prisma.station.findUnique({
        where: { id: stationId },
      });

      if (!station) {
        throw new NotFoundException(
          `Station with ID '${stationId}' not found. Please create the station first.`,
        );
      }
    }

    // Generate a secure, cryptographically random API key
    const apiKey = randomBytes(32).toString('hex');

    // Create new pump
    const pump = await this.prisma.pump.create({
      data: {
        pumpId,
        apiKey,
        ...(stationId && { stationId }),
      },
      include: {
        station: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Pump registered successfully',
      pumpId: pump.pumpId,
      apiKey: pump.apiKey,
      station: pump.station || null,
      registered: true,
    };
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
