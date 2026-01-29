import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getLitersStatistics(pumpId?: string) {
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

  async getAmountStatistics(pumpId?: string) {
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

  async getFuelTypeDistribution(pumpId?: string) {
    const where = pumpId ? { pumpId } : {};

    const data = await this.prisma.pumpData.findMany({
      where,
    });

    const distribution = data.reduce(
      (acc, item) => {
        acc[item.fuelType] = (acc[item.fuelType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return distribution;
  }

  async getNozzleDistribution(pumpId?: string) {
    const where = pumpId ? { pumpId } : {};

    const data = await this.prisma.pumpData.findMany({
      where,
    });

    const distribution = data.reduce(
      (acc, item) => {
        acc[item.nozzle] = (acc[item.nozzle] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return distribution;
  }

  async getTimeSeriesData(pumpId?: string, hours: number = 24) {
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
}
