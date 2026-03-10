/**
 * Response DTOs for Analytics endpoints
 * These define the shape of data returned from analytics queries
 */

// ============== Today Analytics ==============
export class TodayAnalyticsResponse {
  date: string;
  totalLiters: number;
  totalAmount: number;
  transactions: number;
}

// ============== Product-Wise Analytics ==============
export class ProductWiseItem {
  fuelType: string;
  liters: number;
  amount: number;
  transactions?: number;
}

export class ProductWiseResponse {
  date: string;
  products: ProductWiseItem[];
}

// ============== Hourly Analytics ==============
export class HourlyPoint {
  hour: number;
  liters: number;
  amount: number;
  transactions?: number;
}

export class HourlyAnalyticsResponse {
  date: string;
  hours: HourlyPoint[];
  summary: {
    totalLiters: number;
    totalAmount: number;
    totalTransactions: number;
  };
}

// ============== Monthly Analytics ==============
export class MonthlyDayPoint {
  date: string;
  liters: number;
  amount: number;
  transactions: number;
}

export class MonthlyAnalyticsResponse {
  month: number;
  year: number;
  totalLiters: number;
  totalAmount: number;
  totalTransactions: number;
  days: MonthlyDayPoint[];
  averageDailyLiters: number;
  averageDailyAmount: number;
}

// ============== Weekly Analytics ==============
export class WeeklyDayPoint {
  date: string;
  liters: number;
  amount: number;
  transactions: number;
}

export class WeeklyBucketResponse {
  startDate: string;
  endDate: string;
  totalLiters: number;
  totalAmount: number;
  totalTransactions: number;
  days: WeeklyDayPoint[];
  averageDailyLiters: number;
  averageDailyAmount: number;
}

export class WeeklyAnalyticsResponse {
  current: WeeklyBucketResponse;
  previous: WeeklyBucketResponse;
  comparison: {
    amountChangePct: number | null;
    litersChangePct: number | null;
    amountChange: number;
    litersChange: number;
  };
}

// ============== Dashboard Summary ==============
export class DashboardSummaryTotals {
  liters: number;
  amount: number;
  transactions: number;
  activePumps: number;
}

export class DashboardSummaryByPump {
  pumpId: string;
  liters: number;
  amount: number;
  transactions: number;
}

export class DashboardSummaryByNozzle {
  nozzle: number;
  liters: number;
  amount: number;
  transactions: number;
}

export class DashboardSummaryByFuelType {
  fuelType: string;
  liters: number;
  amount: number;
  transactions: number;
}

export class DashboardSummaryTimeSeriesPoint {
  label: string;
  liters: number;
  amount: number;
  transactions: number;
}

export class DashboardSummaryResponse {
  range: {
    from?: string | null;
    to?: string | null;
  };
  totals: DashboardSummaryTotals;
  byPump: DashboardSummaryByPump[];
  byNozzle: DashboardSummaryByNozzle[];
  byFuelType: DashboardSummaryByFuelType[];
  timeSeries: DashboardSummaryTimeSeriesPoint[];
}
