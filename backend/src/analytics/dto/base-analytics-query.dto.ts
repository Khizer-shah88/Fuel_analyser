import { AnalyticsFilterDto } from './analytics-filter.dto';

/**
 * Simple wrapper so we can evolve common analytics
 * query options later without changing controller signatures.
 */
export class BaseAnalyticsQueryDto extends AnalyticsFilterDto {}





