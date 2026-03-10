import axios from 'axios';
import type {
  Pump,
  PumpData,
  FlowStatistics,
  AmountStatistics,
  Distribution,
  DashboardSummary,
  TodayAnalytics,
  MonthlyAnalytics,
  ProductWiseItem,
  HourlyAnalytics,
  WeeklyAnalytics,
  NozzleDashboardItem,
} from '@/types';
import { authStorage } from './auth';

// Backend API base URL
// Defaults to the local NestJS backend (port 3000) with global "api" prefix.
// You can override this via NEXT_PUBLIC_API_URL for other environments.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requestss
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Pumps API
export const pumpsApi = {
  getAll: async (): Promise<Pump[]> => {
    const response = await api.get('/pumps');
    return response.data;
  },

  getById: async (pumpId: string): Promise<Pump> => {
    const response = await api.get(`/pumps/${pumpId}`);
    return response.data;
  },

  getData: async (pumpId: string, limit: number = 100): Promise<PumpData[]> => {
    const response = await api.get(`/pumps/${pumpId}/data`, {
      params: { limit },
    });
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardSummary: async (params?: {
    from?: string;
    to?: string;
    stationId?: string;
    pumpId?: string;
    groupBy?: 'day' | 'month';
  }): Promise<DashboardSummary> => {
    const response = await api.get('/analytics/dashboard', {
      params: params || {},
    });
    return response.data;
  },

  getToday: async (params?: { stationId?: string; pumpId?: string }): Promise<TodayAnalytics> => {
    const response = await api.get('/analytics/today', { params });
    return response.data;
  },

  getMonthly: async (params?: {
    stationId?: string;
    pumpId?: string;
    month?: number;
    year?: number;
  }): Promise<MonthlyAnalytics> => {
    const response = await api.get('/analytics/monthly', { params });
    return response.data;
  },

  getProductWiseToday: async (params?: {
    stationId?: string;
    pumpId?: string;
  }): Promise<ProductWiseItem[]> => {
    const response = await api.get('/analytics/product-wise', { params });
    return response.data;
  },

  getHourlyToday: async (params?: {
    stationId?: string;
    pumpId?: string;
  }): Promise<HourlyAnalytics> => {
    const response = await api.get('/analytics/hourly', { params });
    return response.data;
  },

  getWeekly: async (params?: {
    stationId?: string;
    pumpId?: string;
  }): Promise<WeeklyAnalytics> => {
    const response = await api.get('/analytics/weekly', { params });
    return response.data;
  },

  getLitersStatistics: async (pumpId?: string): Promise<FlowStatistics> => {
    const response = await api.get('/analytics/liters-statistics', {
      params: pumpId ? { pumpId } : {},
    });
    return response.data;
  },

  getAmountStatistics: async (pumpId?: string): Promise<AmountStatistics> => {
    const response = await api.get('/analytics/amount-statistics', {
      params: pumpId ? { pumpId } : {},
    });
    return response.data;
  },

  getFuelTypeDistribution: async (pumpId?: string): Promise<Distribution> => {
    const response = await api.get('/analytics/fuel-type-distribution', {
      params: pumpId ? { pumpId } : {},
    });
    return response.data;
  },

  getNozzleDistribution: async (pumpId?: string): Promise<Distribution> => {
    const response = await api.get('/analytics/nozzle-distribution', {
      params: pumpId ? { pumpId } : {},
    });
    return response.data;
  },

  getTimeSeries: async (pumpId?: string, hours: number = 24): Promise<PumpData[]> => {
    const response = await api.get('/analytics/time-series', {
      params: {
        ...(pumpId ? { pumpId } : {}),
        hours,
      },
    });
    return response.data;
  },

  getNozzleDashboard: async (params?: {
    stationId?: string;
    pumpId?: string;
  }): Promise<NozzleDashboardItem[]> => {
    const response = await api.get('/analytics/nozzle-dashboard', { params });
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

