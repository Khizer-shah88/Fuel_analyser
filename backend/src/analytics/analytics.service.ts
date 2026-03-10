import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { MonthlyAnalyticsQueryDto } from './dto/monthly-analytics.dto';

/**
 * Analytics Service
 * 
 * Provides high-performance analytics queries for fuel management dashboard.
 * Uses efficient Prisma aggregate/groupBy operations for large datasets.
 * 
 * All queries are READ-ONLY and do not require ESP-01 input.
 */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * High-level dashboard summary for KPI cards and charts.
   * Supports optional date range, station, and pump filters.
   * 
   * @param params - Dashboard query parameters with optional filters
   * @returns Complete dashboard summary with totals, breakdowns, and trends
   */
  async getDashboardSummary(params: {
    from?: Date;
    to?: Date;
    stationId?: string;
    pumpId?: string;
    groupBy?: 'day' | 'month';
  }) {
    const { from, to, stationId, pumpId, groupBy = 'day' } = params;

    // Build where clause for PumpData
    const dataWhere: any = {};

    if (pumpId) {
      dataWhere.pumpId = pumpId;
    }

    if (from || to) {
      dataWhere.timestamp = {};
      if (from) dataWhere.timestamp.gte = from;
      if (to) dataWhere.timestamp.lte = to;
    }

    // If stationId is provided, resolve pumps for that station first
    if (stationId) {
      const pumpsForStation = await this.prisma.pump.findMany({
        where: { stationId },
        select: { pumpId: true },
      });

      const pumpIds = pumpsForStation.map((p) => p.pumpId);

      if (pumpIds.length === 0) {
        // No pumps for station – return empty summary
        return {
          range: { from, to },
          totals: {
            liters: 0,
            amount: 0,
            transactions: 0,
            activePumps: 0,
          },
          byPump: [],
          byNozzle: [],
          byFuelType: [],
          timeSeries: [],
        };
      }

      dataWhere.pumpId = { in: pumpIds };
    }

    const data = await this.prisma.pumpData.findMany({
      where: dataWhere,
      orderBy: { timestamp: 'asc' },
    });

    if (data.length === 0) {
      return {
        range: { from, to },
        totals: {
          liters: 0,
          amount: 0,
          transactions: 0,
          activePumps: 0,
        },
        byPump: [],
        byNozzle: [],
        byFuelType: [],
        timeSeries: [],
      };
    }

    // Totals
    let totalLiters = 0;
    let totalAmount = 0;
    const pumpSet = new Set<string>();

    // Grouped aggregations
    const byPumpMap = new Map<
      string,
      { pumpId: string; liters: number; amount: number; transactions: number }
    >();
    const byNozzleMap = new Map<
      number,
      { nozzle: number; liters: number; amount: number; transactions: number }
    >();
    const byFuelTypeMap = new Map<
      string,
      { fuelType: string; liters: number; amount: number; transactions: number }
    >();
    const timeSeriesMap = new Map<
      string,
      { label: string; liters: number; amount: number; transactions: number }
    >();

    const getBucketLabel = (d: Date) => {
      if (groupBy === 'month') {
        // YYYY-MM
        return d.toISOString().slice(0, 7);
      }
      // Default: day (YYYY-MM-DD)
      return d.toISOString().slice(0, 10);
    };

    for (const row of data) {
      totalLiters += row.liters;
      totalAmount += row.amount;
      pumpSet.add(row.pumpId);

      // Per pump
      const pumpEntry =
        byPumpMap.get(row.pumpId) ||
        { pumpId: row.pumpId, liters: 0, amount: 0, transactions: 0 };
      pumpEntry.liters += row.liters;
      pumpEntry.amount += row.amount;
      pumpEntry.transactions += 1;
      byPumpMap.set(row.pumpId, pumpEntry);

      // Per nozzle
      const nozzleEntry =
        byNozzleMap.get(row.nozzle) ||
        { nozzle: row.nozzle, liters: 0, amount: 0, transactions: 0 };
      nozzleEntry.liters += row.liters;
      nozzleEntry.amount += row.amount;
      nozzleEntry.transactions += 1;
      byNozzleMap.set(row.nozzle, nozzleEntry);

      // Per fuel type
      const fuelEntry =
        byFuelTypeMap.get(row.fuelType) ||
        {
          fuelType: row.fuelType,
          liters: 0,
          amount: 0,
          transactions: 0,
        };
      fuelEntry.liters += row.liters;
      fuelEntry.amount += row.amount;
      fuelEntry.transactions += 1;
      byFuelTypeMap.set(row.fuelType, fuelEntry);

      // Time series
      const label = getBucketLabel(row.timestamp);
      const tsEntry =
        timeSeriesMap.get(label) || {
          label,
          liters: 0,
          amount: 0,
          transactions: 0,
        };
      tsEntry.liters += row.liters;
      tsEntry.amount += row.amount;
      tsEntry.transactions += 1;
      timeSeriesMap.set(label, tsEntry);
    }

    return {
      range: { from, to },
      totals: {
        liters: parseFloat(totalLiters.toFixed(2)),
        amount: parseFloat(totalAmount.toFixed(2)),
        transactions: data.length,
        activePumps: pumpSet.size,
      },
      byPump: Array.from(byPumpMap.values()).map((p) => ({
        ...p,
        liters: parseFloat(p.liters.toFixed(2)),
        amount: parseFloat(p.amount.toFixed(2)),
      })),
      byNozzle: Array.from(byNozzleMap.values()).map((n) => ({
        ...n,
        liters: parseFloat(n.liters.toFixed(2)),
        amount: parseFloat(n.amount.toFixed(2)),
      })),
      byFuelType: Array.from(byFuelTypeMap.values()).map((f) => ({
        ...f,
        liters: parseFloat(f.liters.toFixed(2)),
        amount: parseFloat(f.amount.toFixed(2)),
      })),
      timeSeries: Array.from(timeSeriesMap.values()).map((t) => ({
        ...t,
        liters: parseFloat(t.liters.toFixed(2)),
        amount: parseFloat(t.amount.toFixed(2)),
      })),
    };
  }

  /**
   * TODAY analytics – total liters / amount / transactions for the current day.
   */
  async getTodaySummary(filters: AnalyticsFilterDto) {
    const { where } = await this.buildWhereWithFilters(filters);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await this.prisma.pumpData.aggregate({
      _sum: {
        liters: true,
        amount: true,
      },
      _count: {
        _all: true,
      },
      where: {
        ...where,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
    });

    return {
      date: start.toISOString().slice(0, 10),
      totalLiters: result._sum.liters || 0,
      totalAmount: result._sum.amount || 0,
      transactions: result._count._all || 0,
    };
  }

  /**
   * MONTHLY analytics – totals and per-day trend for a month.
   */
  async getMonthlySummary(query: MonthlyAnalyticsQueryDto) {
    const { where } = await this.buildWhereWithFilters(query);

    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1; // 1-based

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const data = await this.prisma.pumpData.findMany({
      where: {
        ...where,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    let totalLiters = 0;
    let totalAmount = 0;
    let totalTransactions = 0;
    const daysMap = new Map<
      string,
      { date: string; liters: number; amount: number; transactions: number }
    >();

    for (const row of data) {
      totalLiters += row.liters;
      totalAmount += row.amount;
      totalTransactions += 1;
      const key = row.timestamp.toISOString().slice(0, 10);
      const entry =
        daysMap.get(key) || { date: key, liters: 0, amount: 0, transactions: 0 };
      entry.liters = this.round2(entry.liters + row.liters);
      entry.amount = this.round2(entry.amount + row.amount);
      entry.transactions += 1;
      daysMap.set(key, entry);
    }

    const days = Array.from(daysMap.values());
    const activeDays = days.length || 1; // Avoid division by zero

    return {
      month,
      year,
      totalLiters: this.round2(totalLiters),
      totalAmount: this.round2(totalAmount),
      totalTransactions,
      days,
      averageDailyLiters: this.round2(totalLiters / activeDays),
      averageDailyAmount: this.round2(totalAmount / activeDays),
    };
  }

  /**
   * PRODUCT-WISE analytics for the current day.
   * Uses Prisma groupBy for efficiency.
   */
  async getProductWiseToday(filters: AnalyticsFilterDto) {
    const { where } = await this.buildWhereWithFilters(filters);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const groups = await this.prisma.pumpData.groupBy({
      by: ['fuelType'],
      _sum: {
        liters: true,
        amount: true,
      },
      where: {
        ...where,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
    });

    return groups.map((g) => ({
      fuelType: g.fuelType,
      liters: g._sum.liters || 0,
      amount: g._sum.amount || 0,
    }));
  }

  /**
   * HOURLY analytics – per-hour buckets for the current day.
   */
  async getHourlyToday(filters: AnalyticsFilterDto) {
    const { where } = await this.buildWhereWithFilters(filters);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const data = await this.prisma.pumpData.findMany({
      where: {
        ...where,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    const buckets: { hour: number; liters: number; amount: number }[] = Array.from(
      { length: 24 },
      (_, hour) => ({ hour, liters: 0, amount: 0 }),
    );

    for (const row of data) {
      const hour = row.timestamp.getHours();
      buckets[hour].liters += row.liters;
      buckets[hour].amount += row.amount;
    }

    return {
      date: start.toISOString().slice(0, 10),
      hours: buckets,
    };
  }

  /**
   * WEEKLY analytics – compare current 7 days with previous 7 days.
   */
  async getWeeklySummary(filters: AnalyticsFilterDto) {
    const { where } = await this.buildWhereWithFilters(filters);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStart = new Date(today);
    currentStart.setDate(today.getDate() - 6); // last 7 days including today
    const currentEnd = new Date(today);
    currentEnd.setHours(23, 59, 59, 999);

    const previousEnd = new Date(currentStart);
    previousEnd.setDate(currentStart.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);

    const [currentData, previousData] = await Promise.all([
      this.prisma.pumpData.findMany({
        where: {
          ...where,
          timestamp: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.pumpData.findMany({
        where: {
          ...where,
          timestamp: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    const buildDailyBuckets = (rows: { timestamp: Date; liters: number; amount: number }[]) => {
      const map = new Map<
        string,
        { date: string; liters: number; amount: number; transactions: number }
      >();

      for (const row of rows) {
        const key = row.timestamp.toISOString().slice(0, 10);
        const entry =
          map.get(key) || { date: key, liters: 0, amount: 0, transactions: 0 };
        entry.liters = this.round2(entry.liters + row.liters);
        entry.amount = this.round2(entry.amount + row.amount);
        entry.transactions += 1;
        map.set(key, entry);
      }

      let totalLiters = 0;
      let totalAmount = 0;
      let totalTransactions = 0;
      const days = Array.from(map.values());
      
      for (const v of days) {
        totalLiters += v.liters;
        totalAmount += v.amount;
        totalTransactions += v.transactions;
      }

      const activeDays = days.length || 1;

      return {
        totalLiters: this.round2(totalLiters),
        totalAmount: this.round2(totalAmount),
        totalTransactions,
        days,
        averageDailyLiters: this.round2(totalLiters / activeDays),
        averageDailyAmount: this.round2(totalAmount / activeDays),
      };
    };

    const current = buildDailyBuckets(currentData);
    const previous = buildDailyBuckets(previousData);

    const amountChangePct = this.calculatePercentChange(current.totalAmount, previous.totalAmount);
    const litersChangePct = this.calculatePercentChange(current.totalLiters, previous.totalLiters);

    return {
      current: {
        startDate: currentStart.toISOString().slice(0, 10),
        endDate: currentEnd.toISOString().slice(0, 10),
        ...current,
      },
      previous: {
        startDate: previousStart.toISOString().slice(0, 10),
        endDate: previousEnd.toISOString().slice(0, 10),
        ...previous,
      },
      comparison: {
        amountChangePct,
        litersChangePct,
        amountChange: this.round2(current.totalAmount - previous.totalAmount),
        litersChange: this.round2(current.totalLiters - previous.totalLiters),
      },
    };
  }

  /**
   * Helper to build a PumpData where filter from common analytics filters.
   * This respects station scoping by resolving pumpIds for a station first.
   */
  private async buildWhereWithFilters(filters: AnalyticsFilterDto) {
    const where: any = {};

    if (filters.pumpId) {
      where.pumpId = filters.pumpId;
    }

    if (filters.stationId) {
      const pumpsForStation = await this.prisma.pump.findMany({
        where: { stationId: filters.stationId },
        select: { pumpId: true },
      });
      const pumpIds = pumpsForStation.map((p) => p.pumpId);
      if (pumpIds.length === 0) {
        // No pumps under this station – force no results
        where.pumpId = '__no_such_pump__';
      } else {
        where.pumpId = { in: pumpIds };
      }
    }

    return { where };
  }

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

  /**
   * Helper: Get date range for a specific period
   * @param period - 'today', 'yesterday', 'thisMonth', 'lastMonth'
   */
  private getDateRange(period: 'today' | 'yesterday' | 'thisMonth' | 'lastMonth') {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
    }

    return { start, end };
  }

  /**
   * Helper: Round number to 2 decimal places
   */
  private round2(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  /**
   * Helper: Get active pump count for a date range
   */
  async getActivePumpCount(where: any): Promise<number> {
    const result = await this.prisma.pumpData.findMany({
      where,
      distinct: ['pumpId'],
      select: { pumpId: true },
    });
    return result.length;
  }

  /**
   * Helper: Calculate percentage change between two values
   */
  private calculatePercentChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return this.round2(((current - previous) / previous) * 100);
  }

  /**
   * NOZZLE DASHBOARD – Get latest transaction for each nozzle across all pumps.
   * Returns data grouped by pumpId and nozzle number, showing the most recent transaction.
   */
  async getNozzleDashboard(filters: AnalyticsFilterDto) {
    const { where } = await this.buildWhereWithFilters(filters);

    // Get all pumps (with station info if available)
    const pumps = await this.prisma.pump.findMany({
      where: filters.stationId ? { stationId: filters.stationId } : {},
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

    if (pumps.length === 0) {
      return [];
    }

    const pumpIds = pumps.map((p) => p.pumpId);
    const finalWhere = {
      ...where,
      pumpId: filters.pumpId ? filters.pumpId : { in: pumpIds },
    };

    // Get latest transaction for each unique (pumpId, nozzle) combination
    // We'll use a subquery approach: for each pump+nozzle combo, get the latest transaction
    const nozzleData: Array<{
      pumpId: string;
      nozzle: number;
      fuelType: string;
      liters: number;
      amount: number;
      timestamp: Date;
      totalMeter: number; // Cumulative sum of liters for this nozzle
    }> = [];

    // Get all unique pump+nozzle combinations
    const uniqueCombos = await this.prisma.pumpData.findMany({
      where: finalWhere,
      distinct: ['pumpId', 'nozzle'],
      select: {
        pumpId: true,
        nozzle: true,
      },
    });

    // For each combination, get the latest transaction and calculate total meter
    for (const combo of uniqueCombos) {
      // Get latest transaction for this pump+nozzle
      const latest = await this.prisma.pumpData.findFirst({
        where: {
          ...finalWhere,
          pumpId: combo.pumpId,
          nozzle: combo.nozzle,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (latest) {
        // Calculate total meter (cumulative sum of all liters for this nozzle)
        const allTransactions = await this.prisma.pumpData.findMany({
          where: {
            ...finalWhere,
            pumpId: combo.pumpId,
            nozzle: combo.nozzle,
          },
          select: {
            liters: true,
          },
        });

        const totalMeter = allTransactions.reduce((sum, t) => sum + t.liters, 0);

        nozzleData.push({
          pumpId: latest.pumpId,
          nozzle: latest.nozzle,
          fuelType: latest.fuelType,
          liters: latest.liters,
          amount: latest.amount,
          timestamp: latest.timestamp,
          totalMeter: this.round2(totalMeter),
        });
      }
    }

    // Enrich with pump and station info
    const enriched = nozzleData.map((data) => {
      const pump = pumps.find((p) => p.pumpId === data.pumpId);
      const rate = data.liters > 0 ? this.round2(data.amount / data.liters) : 0;

      return {
        pumpId: data.pumpId,
        nozzle: data.nozzle,
        fuelType: data.fuelType,
        saleAmount: this.round2(data.amount),
        saleQty: this.round2(data.liters),
        rate,
        totalMeter: data.totalMeter,
        saleDateTime: data.timestamp,
        station: pump?.station
          ? {
              id: pump.station.id,
              name: pump.station.name,
              location: pump.station.location,
            }
          : null,
      };
    });

    // Sort by station name, then pumpId, then nozzle
    enriched.sort((a, b) => {
      const stationA = a.station?.name || '';
      const stationB = b.station?.name || '';
      if (stationA !== stationB) return stationA.localeCompare(stationB);
      if (a.pumpId !== b.pumpId) return a.pumpId.localeCompare(b.pumpId);
      return a.nozzle - b.nozzle;
    });

    return enriched;
  }
}

