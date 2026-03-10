'use client';

import { format, parseISO } from 'date-fns';
import { Droplet, Clock, Gauge, Banknote, MapPin } from 'lucide-react';
import type { NozzleDashboardItem } from '@/types';

interface NozzleCardProps {
  data: NozzleDashboardItem;
}

export default function NozzleCard({ data }: NozzleCardProps) {
  const {
    station,
    nozzle,
    fuelType,
    saleAmount,
    saleQty,
    rate,
    totalMeter,
    saleDateTime,
  } = data;

  // Format date time
  let formattedDateTime = '';
  try {
    const date = parseISO(saleDateTime);
    formattedDateTime = format(date, 'dd-MMM-yy hh:mm a').toUpperCase();
  } catch {
    formattedDateTime = saleDateTime;
  }

  // Fuel type colors - modern gradients
  const fuelTypeConfig: Record<string, { gradient: string; badge: string; glow: string }> = {
    PETROL: { 
      gradient: 'from-emerald-500 to-green-600', 
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glow: 'shadow-emerald-500/20'
    },
    DIESEL: { 
      gradient: 'from-blue-500 to-indigo-600', 
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      glow: 'shadow-blue-500/20'
    },
  };

  const fuelConfig = fuelTypeConfig[fuelType] || {
    gradient: 'from-slate-500 to-slate-600',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    glow: 'shadow-slate-500/20'
  };

  const siteName = station?.name || 'Unknown Site';
  const siteLocation = station?.location || '';

  return (
    <div className={`glass-card group hover:shadow-xl hover:${fuelConfig.glow} transition-all duration-300 overflow-hidden`}>
      {/* Fuel Type Indicator Bar - Gradient */}
      <div className={`h-1.5 bg-gradient-to-r ${fuelConfig.gradient}`} />

      <div className="p-5">
        {/* Header: Site Name & Nozzle Number */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{siteName}</h3>
            {siteLocation && (
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {siteLocation}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end ml-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Dispensor</span>
            <span className="text-2xl font-bold text-white font-display">#{nozzle}</span>
          </div>
        </div>

        {/* Fuel Type Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${fuelConfig.badge}`}
          >
            <Droplet className="w-3.5 h-3.5" />
            {fuelType}
          </span>
        </div>

        {/* Sale Amount - Hero Value */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-medium">Sale Amount</span>
            </div>
            <span className="text-xl font-bold text-white font-display">
              PKR {saleAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Sale Qty */}
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Qty (Ltr)</span>
            <span className="text-sm font-semibold text-white">
              {saleQty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Rate */}
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Rate</span>
            <span className="text-sm font-semibold text-white">
              PKR {rate.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Meter */}
        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-slate-400">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-medium">Total Meter</span>
          </div>
          <span className="text-sm font-semibold text-slate-300">
            {totalMeter.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Sale DateTime */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Last Sale</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">{formattedDateTime}</p>
        </div>
      </div>
    </div>
  );
}

