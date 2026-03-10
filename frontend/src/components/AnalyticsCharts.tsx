'use client';

import { useEffect, useState } from 'react';
import { BarChart3, PieChart, Activity } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import TimeSeriesChart from './charts/TimeSeriesChart';
import FuelTypeChart from './charts/FuelTypeChart';
import NozzleChart from './charts/NozzleChart';
import type {
  DashboardSummary,
  DashboardSummaryByFuelType,
  DashboardSummaryByNozzle,
  DashboardSummaryTimeSeriesPoint,
} from '@/types';

interface AnalyticsChartsProps {
  pumpId?: string;
}

export default function AnalyticsCharts({ pumpId }: AnalyticsChartsProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.getDashboardSummary(
          pumpId ? { pumpId, groupBy: 'day' } : { groupBy: 'day' },
        );
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [pumpId]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-slate-200/50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = summary && (
    (summary.timeSeries && summary.timeSeries.length > 0) ||
    (summary.byFuelType && summary.byFuelType.length > 0) ||
    (summary.byNozzle && summary.byNozzle.length > 0)
  );

  if (!hasData) {
    return (
      <div className="glass-card rounded-2xl border border-slate-200/50 p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 mb-2">No Data Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Analytics will appear here once pumps start sending transaction data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="glass-card rounded-2xl border border-slate-200/50 p-5 sm:p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900">
              {pumpId ? `${pumpId} Trend` : '24 Hour Trend'}
            </h3>
            <p className="text-xs text-slate-500">Transaction volume over time</p>
          </div>
        </div>
        <TimeSeriesChart
          data={(summary?.timeSeries || []) as DashboardSummaryTimeSeriesPoint[]}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Type Distribution */}
        <div className="glass-card rounded-2xl border border-slate-200/50 p-5 sm:p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900">Fuel Types</h3>
              <p className="text-xs text-slate-500">Distribution by type</p>
            </div>
          </div>
          {summary?.byFuelType && summary.byFuelType.length > 0 ? (
            <FuelTypeChart
              data={Object.fromEntries(
                summary.byFuelType.map((f: DashboardSummaryByFuelType) => [
                  f.fuelType,
                  f.liters,
                ]),
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No fuel type data
            </div>
          )}
        </div>

        {/* Nozzle Distribution */}
        <div className="glass-card rounded-2xl border border-slate-200/50 p-5 sm:p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900">Nozzles</h3>
              <p className="text-xs text-slate-500">Usage by nozzle</p>
            </div>
          </div>
          {summary?.byNozzle && summary.byNozzle.length > 0 ? (
            <NozzleChart
              data={Object.fromEntries(
                summary.byNozzle.map((n: DashboardSummaryByNozzle) => [
                  String(n.nozzle),
                  n.liters,
                ]),
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No nozzle data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

