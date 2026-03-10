'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AmountStatistics } from '@/types';

interface AmountChartProps {
  data: AmountStatistics;
}

export default function AmountChart({ data }: AmountChartProps) {
  const chartData = [
    { name: 'Min', value: data.min, color: '#ef4444' },
    { name: 'Average', value: data.average, color: '#3b82f6' },
    { name: 'Max', value: data.max, color: '#10b981' },
    { name: 'Total', value: data.total, color: '#8b5cf6' },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`PKR ${value.toFixed(2)}`, 'Amount']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-600">Count</p>
          <p className="text-xl font-bold text-slate-900">{data.count}</p>
        </div>
        <div>
          <p className="text-slate-600">Average</p>
          <p className="text-xl font-bold text-primary-600">PKR {data.average.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
















