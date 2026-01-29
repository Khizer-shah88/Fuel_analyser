'use client';

import { useState } from 'react';
import {
  Activity,
  Droplet,
  DollarSign,
  TrendingUp,
  LogOut,
  User,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StatCard from './StatCard';
import PumpsList from './PumpsList';
import AnalyticsCharts from './AnalyticsCharts';
import type { Pump } from '@/types';

// Modern, soft, professional color theme
const BACKGROUND_GRADIENT =
  'bg-gradient-to-br from-[#faf8f6] via-[#ffeede] to-[#fffaf5]'; // Softer, cleaner
const CARD_BG =
  'bg-gradient-to-tr from-white via-[#fff3eb] to-[#fdf2e9]';

interface DashboardProps {
  pumps: Pump[];
}

export default function Dashboard({ pumps }: DashboardProps) {
  const [selectedPumpId, setSelectedPumpId] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Calculate total statistics (sum up all data for liters / amount)
  const totalPumps = pumps.length;
  const totalTransactions = pumps.reduce((sum, pump) => sum + (pump.data?.length || 0), 0);
  const totalLiters = pumps.reduce(
    (sum, pump) =>
      sum +
      (pump.data ? pump.data.reduce((lSum, d) => lSum + (d.liters || 0), 0) : 0),
    0
  );
  const totalAmount = pumps.reduce(
    (sum, pump) =>
      sum + (pump.data ? pump.data.reduce((aSum, d) => aSum + (d.amount || 0), 0) : 0),
    0
  );

  return (
    <div className={`min-h-screen w-full ${BACKGROUND_GRADIENT} transition-colors duration-300`}>
      {/* Header - Cylinder Style, matches background */}
      <div className="pt-2 sm:pt-3" />
      <header
        className={`
          sticky top-0 z-30
          ${BACKGROUND_GRADIENT}
          backdrop-blur-lg
          shadow-md
          border-b border-orange-100
          transition
          rounded-full
          mx-2 sm:mx-4 md:mx-6 lg:mx-10
        `}
        style={{
          borderRadius: '9999px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-y-3">
            {/* Logo / title / subtitle */}
            <div className="flex items-center gap-x-4 w-full sm:w-auto justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">
                  Fuel Pump <span className="text-orange-500">Dash</span>
                </h1>
                <p className="text-xs sm:text-base text-orange-400 font-medium mt-1">
                  Real-time monitoring & analytics
                </p>
              </div>
              <button
                onClick={() => setMobileNavOpen((v) => !v)}
                className="sm:hidden ml-2 p-2 rounded-full text-orange-500 hover:bg-orange-100"
              >
                <Menu />
              </button>
            </div>
            <div
              className={`
                flex-col sm:flex-row sm:items-center sm:space-x-4
                flex
                transition-all
                ${mobileNavOpen ? 'flex' : 'hidden sm:flex'}
                w-full sm:w-auto gap-y-3 mt-2 sm:mt-0
              `}
            >
              <div className="flex items-center space-x-2 text-slate-700">
                <User className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-medium truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#ffe8db] to-[#ffb185] shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-70"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
                </span>
                <Activity className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-bold text-orange-700 tracking-wide ml-1 select-none">Live</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-white hover:bg-orange-400 focus:ring-2 focus:ring-orange-400 rounded-full transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 md:mb-10">
          <div className={`rounded-xl shadow-lg ${CARD_BG} transform hover:scale-[1.03] transition`}>
            <StatCard
              title="Total Pumps"
              value={totalPumps.toString()}
              icon={<Activity className="w-6 h-6 sm:w-7 sm:h-7" />}
              color="blue"
            />
          </div>
          <div className={`rounded-xl shadow-lg ${CARD_BG} transform hover:scale-[1.03] transition`}>
            <StatCard
              title="Transactions"
              value={totalTransactions.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />}
              color="green"
            />
          </div>
          <div className={`rounded-xl shadow-lg ${CARD_BG} transform hover:scale-[1.03] transition`}>
            <StatCard
              title="Total Liters"
              value={totalLiters.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              icon={<Droplet className="w-6 h-6 sm:w-7 sm:h-7" />}
              color="cyan"
            />
          </div>
          <div className={`rounded-xl shadow-lg ${CARD_BG} transform hover:scale-[1.03] transition`}>
            <StatCard
              title="Total Amount"
              value={`₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={<DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />}
              color="purple"
            />
          </div>
        </div>

        {/* Pumps List and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Pumps List */}
          <div className="lg:col-span-1 rounded-xl bg-white/80 shadow-lg border border-orange-100 backdrop-blur-sm transition">
            <PumpsList
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onSelectPump={setSelectedPumpId}
            />
          </div>

          {/* Analytics Charts */}
          <div className="lg:col-span-2 rounded-xl bg-white/80 shadow-lg border border-orange-100 backdrop-blur-sm mt-4 lg:mt-0 transition">
            <AnalyticsCharts pumpId={selectedPumpId} />
          </div>
        </div>
      </main>
      {/* Subtle background decoration (invisible on mobile, visible on large screens) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden md:flex items-end justify-end opacity-80"
        style={{ minHeight: '60vh' }}
      >
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none" className="blur-3xl">
          <circle cx="220" cy="120" r="100" fill="#ffb185" fillOpacity="0.15"/>
          <circle cx="80" cy="320" r="90" fill="#fabd8d" fillOpacity="0.06"/>
        </svg>
      </div>
    </div>
  );
}
