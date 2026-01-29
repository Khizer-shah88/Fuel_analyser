'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import LitersChart from './charts/LitersChart';
import AmountChart from './charts/AmountChart';
import FuelTypeChart from './charts/FuelTypeChart';
import NozzleChart from './charts/NozzleChart';
import TimeSeriesChart from './charts/TimeSeriesChart';
import type { FlowStatistics, AmountStatistics, Distribution, PumpData } from '@/types';

interface AnalyticsChartsProps {
  pumpId?: string;
}

export default function AnalyticsCharts({ pumpId }: AnalyticsChartsProps) {
  const [litersStats, setLitersStats] = useState<FlowStatistics | null>(null);
  const [amountStats, setAmountStats] = useState<AmountStatistics | null>(null);
  const [fuelTypeDist, setFuelTypeDist] = useState<Distribution>({});
  const [nozzleDist, setNozzleDist] = useState<Distribution>({});
  const [timeSeriesData, setTimeSeriesData] = useState<PumpData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [liters, amount, fuelType, nozzle, timeSeries] = await Promise.all([
          analyticsApi.getLitersStatistics(pumpId),
          analyticsApi.getAmountStatistics(pumpId),
          analyticsApi.getFuelTypeDistribution(pumpId),
          analyticsApi.getNozzleDistribution(pumpId),
          analyticsApi.getTimeSeries(pumpId, 24),
        ]);

        setLitersStats(liters);
        setAmountStats(amount);
        setFuelTypeDist(fuelType);
        setNozzleDist(nozzle);
        setTimeSeriesData(timeSeries);
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {pumpId ? `Pump ${pumpId} - ` : 'All Pumps - '}24 Hour Trend
        </h3>
        <TimeSeriesChart data={timeSeriesData} />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liters Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Liters Statistics</h3>
          {litersStats && <LitersChart data={litersStats} />}
        </div>

        {/* Amount Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Amount Statistics</h3>
          {amountStats && <AmountChart data={amountStats} />}
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Fuel Type Distribution</h3>
          <FuelTypeChart data={fuelTypeDist} />
        </div>

        {/* Nozzle Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Nozzle Distribution</h3>
          <NozzleChart data={nozzleDist} />
        </div>
      </div>
    </div>
  );
}

