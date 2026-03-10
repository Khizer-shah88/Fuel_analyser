import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { AnalyticsFilterDto } from './analytics-filter.dto';

/**
 * Query params for monthly analytics.
 * Defaults to the current month/year when not provided.
 */
export class MonthlyAnalyticsQueryDto extends AnalyticsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}





