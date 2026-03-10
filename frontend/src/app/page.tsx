'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { pumpsApi, analyticsApi } from '@/lib/api';
import type {
  Pump,
  TodayAnalytics,
  MonthlyAnalytics,
  ProductWiseItem,
  HourlyAnalytics,
  WeeklyAnalytics,
} from '@/types';

/**
 * Main Dashboard Page
 * 
 * Data Flow:
 * 1. Load all pumps from /api/pumps
 * 2. Fetch analytics from multiple endpoints in parallel:
 *    - GET /api/analytics/today
 *    - GET /api/analytics/monthly
 *    - GET /api/analytics/product-wise
 *    - GET /api/analytics/hourly
 *    - GET /api/analytics/weekly
 * 3. Pass aggregated data to Dashboard component
 * 4. Auto-refresh every 10 seconds for real-time updates
 */
export default function Home() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [today, setToday] = useState<TodayAnalytics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [productWise, setProductWise] = useState<ProductWiseItem[] | null>(null);
  const [hourly, setHourly] = useState<HourlyAnalytics | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          pumpsData,
          todaySummary,
          monthlySummary,
          productWiseSummary,
          hourlySummary,
          weeklySummary,
        ] = await Promise.all([
          pumpsApi.getAll(),
          analyticsApi.getToday(),
          analyticsApi.getMonthly(),
          analyticsApi.getProductWiseToday(),
          analyticsApi.getHourlyToday(),
          analyticsApi.getWeekly(),
        ]);
        
        // Set real data from API (no demo/mock data)
        setPumps(pumpsData || []);
        setToday(todaySummary || null);
        setMonthly(monthlySummary || null);
        setProductWise(productWiseSummary || null);
        setHourly(hourlySummary || null);
        setWeekly(weeklySummary || null);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError('Failed to load dashboard. Make sure the backend is running. ' + errorMessage);
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on component mount
    fetchDashboardData();

    // Auto-refresh every 10 seconds for real-time analytics updates
    const interval = setInterval(fetchDashboardData, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f6] via-[#ffeede] to-[#fffaf5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
          <p className="text-xs text-slate-500 mt-2">Fetching real-time data from WiFi modules</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f6] via-[#ffeede] to-[#fffaf5]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md border-l-4 border-red-500">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-slate-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Dashboard
        pumps={pumps}
        today={today || undefined}
        monthly={monthly || undefined}
        productWise={productWise || undefined}
        hourly={hourly || undefined}
        weekly={weekly || undefined}
      />
    </ProtectedRoute>
  );
}

