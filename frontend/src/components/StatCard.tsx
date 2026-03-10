import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'cyan' | 'violet' | 'blue' | 'green' | 'purple';
  trend?: string;
}

const colorConfig = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    gradient: 'from-indigo-500 to-indigo-600',
    border: 'border-indigo-100',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    gradient: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-100',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    gradient: 'from-cyan-500 to-cyan-600',
    border: 'border-cyan-100',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    iconBg: 'bg-violet-100',
    gradient: 'from-violet-500 to-violet-600',
    border: 'border-violet-100',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-100',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    iconBg: 'bg-green-100',
    gradient: 'from-green-500 to-green-600',
    border: 'border-green-100',
    glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    iconBg: 'bg-purple-100',
    gradient: 'from-purple-500 to-purple-600',
    border: 'border-purple-100',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  },
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const config = colorConfig[color] || colorConfig.indigo;
  
  return (
    <div className={`stat-card glass-card rounded-2xl p-5 sm:p-6 border ${config.border} ${config.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 truncate">{value}</p>
          {trend && (
            <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.gradient}`} />
              {trend}
            </p>
          )}
        </div>
        <div className={`${config.iconBg} ${config.icon} p-3 rounded-xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

