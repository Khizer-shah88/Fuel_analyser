'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { PumpData, DashboardSummaryTimeSeriesPoint } from '@/types';

interface TimeSeriesChartProps {
  data: PumpData[] | DashboardSummaryTimeSeriesPoint[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>No time series data available</p>
      </div>
    );
  }

  // Check if data is PumpData (has timestamp) or DashboardSummaryTimeSeriesPoint (has label)
  const isPumpData = (item: any): item is PumpData => 'timestamp' in item;
  const isDashboardPoint = (item: any): item is DashboardSummaryTimeSeriesPoint => 'label' in item;

  const chartData = data
    .map((item) => {
      if (isPumpData(item)) {
        // Handle PumpData format (has timestamp field)
        try {
          return {
            time: format(parseISO(item.timestamp), 'HH:mm'),
            liters: item.liters,
            amount: item.amount,
            timestamp: item.timestamp,
          };
        } catch (error) {
          // Fallback if timestamp parsing fails
          return {
            time: item.timestamp,
            liters: item.liters,
            amount: item.amount,
            timestamp: item.timestamp,
          };
        }
      } else if (isDashboardPoint(item)) {
        // Handle DashboardSummaryTimeSeriesPoint format (has label field)
        // Label can be date (YYYY-MM-DD) or month (YYYY-MM)
        try {
          // Try to parse as date and format
          const parsed = parseISO(item.label);
          // If label is a full date, show date; if it's just month, show month
          const timeLabel = item.label.length === 10 
            ? format(parsed, 'MMM dd') // e.g., "Jan 30"
            : format(parsed, 'MMM yyyy'); // e.g., "Jan 2026"
          return {
            time: timeLabel,
            liters: item.liters,
            amount: item.amount,
            timestamp: item.label,
          };
        } catch (error) {
          // Fallback to label as-is
          return {
            time: item.label,
            liters: item.liters,
            amount: item.amount,
            timestamp: item.label,
          };
        }
      }
      // Fallback for unknown format
      return {
        time: 'Unknown',
        liters: (item as any).liters || 0,
        amount: (item as any).amount || 0,
        timestamp: (item as any).timestamp || (item as any).label || '',
      };
    })
    .reverse(); // Show oldest to newest

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="time"
          stroke="#64748b"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          stroke="#3b82f6"
          tick={{ fontSize: 12 }}
          label={{ value: 'Liters', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#10b981"
          tick={{ fontSize: 12 }}
          label={{ value: 'Amount (PKR)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'liters') return [`${value.toFixed(2)}L`, 'Liters'];
            if (name === 'amount') return [`PKR ${value.toFixed(2)}`, 'Amount'];
            return [value, name];
          }}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="liters"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Liters"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Amount (PKR)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
















