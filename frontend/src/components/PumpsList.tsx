'use client';

import { Fuel } from 'lucide-react';
import type { Pump } from '@/types';

interface PumpsListProps {
  pumps: Pump[];
  selectedPumpId?: string;
  onSelectPump: (pumpId: string | undefined) => void;
}

export default function PumpsList({ pumps, selectedPumpId, onSelectPump }: PumpsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Pumps</h2>
        <button
          onClick={() => onSelectPump(undefined)}
          className={`text-sm px-3 py-1 rounded-md transition-colors ${
            !selectedPumpId
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All
        </button>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {pumps.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Fuel className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No pumps found</p>
          </div>
        ) : (
          pumps.map((pump) => {
            const latestData = pump.data?.[0];
            const isSelected = selectedPumpId === pump.pumpId;

            return (
              <button
                key={pump.id}
                onClick={() => onSelectPump(isSelected ? undefined : pump.pumpId)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Fuel className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-900">{pump.pumpId}</span>
                  </div>
                  {latestData && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {pump.station && (
                  <p className="text-sm text-slate-600 mb-1">{pump.station.name}</p>
                )}
                {latestData && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{latestData.liters.toFixed(2)}L</span>
                      <span>₹{latestData.amount.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

