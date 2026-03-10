import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BaseAnalyticsQueryDto } from './dto/base-analytics-query.dto';
import { MonthlyAnalyticsQueryDto } from './dto/monthly-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * High-level dashboard summary (generic).
   * NOTE: You now have more specific endpoints below for the main dashboard cards/charts.
   */
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboardSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('stationId') stationId?: string,
    @Query('pumpId') pumpId?: string,
    @Query('groupBy') groupBy?: 'day' | 'month',
  ) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) {
        throw new BadRequestException('Invalid "from" date');
      }
      fromDate = d;
    }

    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) {
        throw new BadRequestException('Invalid "to" date');
      }
      toDate = d;
    }

    const normalizedGroupBy: 'day' | 'month' =
      groupBy === 'month' ? 'month' : 'day';

    return this.analyticsService.getDashboardSummary({
      from: fromDate,
      to: toDate,
      stationId,
      pumpId,
      groupBy: normalizedGroupBy,
    });

    
  }

  /**
   * TODAY – total sale amount and liters for the current day.
   */
  @UseGuards(JwtAuthGuard)
  @Get('today')
  getToday(@Query() query: BaseAnalyticsQueryDto) {
    return this.analyticsService.getTodaySummary(query);
  }

  /**
   * MONTHLY – totals and per-day trend for a specific month.
   * Defaults to the current month/year if not provided.
   */
  @UseGuards(JwtAuthGuard)
  @Get('monthly')
  getMonthly(@Query() query: MonthlyAnalyticsQueryDto) {
    return this.analyticsService.getMonthlySummary(query);
  }

  /**
   * PRODUCT-WISE – per-fuel-type totals for the current day.
   */
  @UseGuards(JwtAuthGuard)
  @Get('product-wise')
  getProductWise(@Query() query: BaseAnalyticsQueryDto) {
    return this.analyticsService.getProductWiseToday(query);
  }

  /**
   * HOURLY – per-hour buckets for the current day.
   */
  @UseGuards(JwtAuthGuard)
  @Get('hourly')
  getHourly(@Query() query: BaseAnalyticsQueryDto) {
    return this.analyticsService.getHourlyToday(query);
  }

  /**
   * WEEKLY – last 7 days vs previous 7 days comparison.
   */
  @UseGuards(JwtAuthGuard)
  @Get('weekly')
  getWeekly(@Query() query: BaseAnalyticsQueryDto) {
    return this.analyticsService.getWeeklySummary(query);
  }

  @Get('liters-statistics')
  getLitersStatistics(@Query('pumpId') pumpId?: string) {
    return this.analyticsService.getLitersStatistics(pumpId);
  }

  @Get('amount-statistics')
  getAmountStatistics(@Query('pumpId') pumpId?: string) {
    return this.analyticsService.getAmountStatistics(pumpId);
  }

  @Get('fuel-type-distribution')
  getFuelTypeDistribution(@Query('pumpId') pumpId?: string) {
    return this.analyticsService.getFuelTypeDistribution(pumpId);
  }

  @Get('nozzle-distribution')
  getNozzleDistribution(@Query('pumpId') pumpId?: string) {
    return this.analyticsService.getNozzleDistribution(pumpId);
  }

  @Get('time-series')
  getTimeSeriesData(
    @Query('pumpId') pumpId?: string,
    @Query('hours') hours?: string,
  ) {
    return this.analyticsService.getTimeSeriesData(
      pumpId,
      hours ? parseInt(hours) : 24,
    );
  }

  /**
   * NOZZLE DASHBOARD – Latest transaction data for each nozzle across all pumps.
   * Returns card-ready data showing site, dispensor#, fuel type, sale amount, qty, rate, total meter, and datetime.
   */
  @UseGuards(JwtAuthGuard)
  @Get('nozzle-dashboard')
  getNozzleDashboard(@Query() query: BaseAnalyticsQueryDto) {
    return this.analyticsService.getNozzleDashboard(query);
  }
}
