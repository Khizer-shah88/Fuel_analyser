import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
}
