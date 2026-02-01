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












