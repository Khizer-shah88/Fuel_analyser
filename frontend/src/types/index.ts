export interface Pump {
  id: string;
  pumpId: string;
  apiKey: string;
  stationId: string;
  station?: {
    id: string;
    name: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;
  data?: PumpData[];
}

export interface PumpData {
  id: string;
  pumpId: string;
  liters: number;
  amount: number;
  nozzle: number;
  fuelType: string;
  timestamp: string;
  createdAt: string;
}

export interface FlowStatistics {
  average: number;
  min: number;
  max: number;
  total: number;
  count: number;
}

export interface AmountStatistics {
  average: number;
  min: number;
  max: number;
  total: number;
  count: number;
}

export interface Distribution {
  [key: string]: number;
}

// --- Dashboard analytics types from new endpoints ---

export interface TodayAnalytics {
  date: string;
  totalLiters: number;
  totalAmount: number;
  transactions: number;
}

export interface MonthlyDayPoint {
  date: string;
  liters: number;
  amount: number;
  transactions: number;
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  totalLiters: number;
  totalAmount: number;
  totalTransactions: number;
  days: MonthlyDayPoint[];
  averageDailyLiters: number;
  averageDailyAmount: number;
}

export interface ProductWiseItem {
  fuelType: string;
  liters: number;
  amount: number;
  transactions?: number;
}

export interface HourlyPoint {
  hour: number;
  liters: number;
  amount: number;
  transactions?: number;
}

export interface HourlyAnalytics {
  date: string;
  hours: HourlyPoint[];
  summary?: {
    totalLiters: number;
    totalAmount: number;
    totalTransactions: number;
  };
}

export interface WeeklyDayPoint {
  date: string;
  liters: number;
  amount: number;
  transactions: number;
}

export interface WeeklyBucket {
  startDate: string;
  endDate: string;
  totalLiters: number;
  totalAmount: number;
  totalTransactions: number;
  days: WeeklyDayPoint[];
  averageDailyLiters: number;
  averageDailyAmount: number;
}

export interface WeeklyAnalytics {
  current: WeeklyBucket;
  previous: WeeklyBucket;
  comparison: {
    amountChangePct: number | null;
    litersChangePct: number | null;
    amountChange: number;
    litersChange: number;
  };
}

// Dashboard analytics summary from /analytics/dashboard
export interface DashboardSummaryTotals {
  liters: number;
  amount: number;
  transactions: number;
  activePumps: number;
}

export interface DashboardSummaryByPump {
  pumpId: string;
  liters: number;
  amount: number;
  transactions: number;
}

export interface DashboardSummaryByNozzle {
  nozzle: number;
  liters: number;
  amount: number;
  transactions: number;
}

export interface DashboardSummaryByFuelType {
  fuelType: string;
  liters: number;
  amount: number;
  transactions: number;
}

export interface DashboardSummaryTimeSeriesPoint {
  label: string; // e.g. '2026-02-04' or '2026-02'
  liters: number;
  amount: number;
  transactions: number;
}

export interface DashboardSummary {
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

export interface NozzleDashboardItem {
  pumpId: string;
  nozzle: number;
  fuelType: string;
  saleAmount: number;
  saleQty: number;
  rate: number;
  totalMeter: number;
  saleDateTime: string;
  station: {
    id: string;
    name: string;
    location: string | null;
  } | null;
}
















