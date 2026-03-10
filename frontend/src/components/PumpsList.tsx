'use client';

import { Fuel, Zap, ChevronRight } from 'lucide-react';
import type { Pump } from '@/types';

interface PumpsListProps {
  pumps: Pump[];
  selectedPumpId?: string;
  onSelectPump: (pumpId: string | undefined) => void;
}

export default function PumpsList({ pumps, selectedPumpId, onSelectPump }: PumpsListProps) {
  return (
    <div className="glass-card rounded-2xl border border-slate-200/50 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Pumps</h2>
              <p className="text-xs text-slate-500">{pumps?.length || 0} registered</p>
            </div>
          </div>
          <button
            onClick={() => onSelectPump(undefined)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              !selectedPumpId
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 space-y-3 max-h-[500px] overflow-y-auto">
        {!pumps || pumps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Fuel className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No pumps registered</h3>
            <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
              Connect ESP-01 WiFi modules to register pumps
            </p>
          </div>
        ) : (
          pumps.map((pump) => {
            const latestData = pump.data?.[0];
            const isSelected = selectedPumpId === pump.pumpId;

            return (
              <button
                key={pump.id}
                onClick={() => onSelectPump(isSelected ? undefined : pump.pumpId)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                    : 'border-transparent bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-primary-100' 
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <Zap className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{pump.pumpId}</span>
                      {pump.station && (
                        <span className="text-xs text-slate-500">{pump.station.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {latestData && (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        Active
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${
                      isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'
                    }`} />
                  </div>
                </div>
                
                {latestData && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <span className="text-xs text-slate-500 block">Liters</span>
                      <span className="text-sm font-bold text-slate-900">{latestData.liters?.toFixed(2) || '0.00'}L</span>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/50">
                      <span className="text-xs text-slate-500 block">Amount</span>
                      <span className="text-sm font-bold text-slate-900">PKR {latestData.amount?.toFixed(0) || '0'}</span>
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

