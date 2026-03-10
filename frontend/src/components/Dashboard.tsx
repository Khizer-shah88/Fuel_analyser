'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Droplet,
  DollarSign,
  TrendingUp,
  LogOut,
  User,
  Menu,
  Gauge,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StatCard from './StatCard';
import PumpsList from './PumpsList';
import AnalyticsCharts from './AnalyticsCharts';
import { analyticsApi } from '@/lib/api';
import type {
  Pump,
  TodayAnalytics,
  MonthlyAnalytics,
  ProductWiseItem,
  HourlyAnalytics,
  WeeklyAnalytics,
} from '@/types';

interface DashboardProps {
  pumps: Pump[];
  today?: TodayAnalytics;
  monthly?: MonthlyAnalytics;
  productWise?: ProductWiseItem[];
  hourly?: HourlyAnalytics;
  weekly?: WeeklyAnalytics;
}

// Sidebar menu for mobile navigation
function MobileSidebar({
  open,
  onClose,
  user,
  router,
  handleLogout,
}: {
  open: boolean;
  onClose: () => void;
  user: { email?: string } | null;
  router: ReturnType<typeof useRouter>;
  handleLogout: () => void;
}) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent | TouchEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } lg:hidden`}
        onClick={onClose}
      />
      {/* Sidebar panel */}
      <nav
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full z-50 lg:hidden 
          bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 
          w-[85vw] max-w-xs
          transform transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200/50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Fuel<span className="text-gradient">Dash</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-5 space-y-2">
          <button
            onClick={() => { router.push('/nozzle-dashboard'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition font-medium"
          >
            <Gauge className="w-5 h-5" />
            <span>Nozzle Dashboard</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
        
        <div className="p-5 border-t border-slate-200/50 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
  
export default function Dashboard({
  pumps,
  today: initialToday,
  monthly: initialMonthly,
  productWise: initialProductWise,
  hourly: initialHourly,
  weekly: initialWeekly,
}: DashboardProps) {
  const [selectedPumpId, setSelectedPumpId] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [today, setToday] = useState<TodayAnalytics | undefined>(initialToday);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | undefined>(initialMonthly);
  const [productWise, setProductWise] = useState<ProductWiseItem[] | undefined>(initialProductWise);
  const [hourly, setHourly] = useState<HourlyAnalytics | undefined>(initialHourly);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | undefined>(initialWeekly);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true);
        const params = selectedPumpId ? { pumpId: selectedPumpId } : {};
        
        const [
          todaySummary,
          monthlySummary,
          productWiseSummary,
          hourlySummary,
          weeklySummary,
        ] = await Promise.all([
          analyticsApi.getToday(params),
          analyticsApi.getMonthly(params),
          analyticsApi.getProductWiseToday(params),
          analyticsApi.getHourlyToday(params),
          analyticsApi.getWeekly(params),
        ]);

        setToday(todaySummary);
        setMonthly(monthlySummary);
        setProductWise(productWiseSummary);
        setHourly(hourlySummary);
        setWeekly(weeklySummary);
      } catch (error) {
        console.error('Failed to fetch filtered analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
    const interval = setInterval(fetchFilteredData, 10000);
    return () => clearInterval(interval);
  }, [selectedPumpId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const totalPumps = selectedPumpId ? 1 : (pumps?.length || 0);
  const totalTransactions = today?.transactions ?? 0;
  const totalLiters = today?.totalLiters ?? 0;
  const totalAmount = today?.totalAmount ?? 0;

  return (
    <div className="min-h-screen w-full mesh-bg">
      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
        router={router}
        handleLogout={handleLogout}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
                  Fuel<span className="text-gradient">Dash</span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Real-time Analytics</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Live Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-700">Live</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">{user?.email}</span>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => router.push('/nozzle-dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Gauge className="w-4 h-4" />
                <span>Nozzles</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Filter Indicator */}
        {selectedPumpId && (
          <div className="mb-6 p-4 glass-card rounded-2xl flex items-center justify-between border border-primary-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Filtering by: <span className="text-primary-600">{selectedPumpId}</span>
                </p>
                <p className="text-xs text-slate-500">Showing data for selected pump</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPumpId(undefined)}
              className="px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title={selectedPumpId ? "Selected Pump" : "Total Pumps"}
            value={totalPumps > 0 ? totalPumps.toString() : "0"}
            icon={<Activity className="w-6 h-6" />}
            color="indigo"
            trend={selectedPumpId ? undefined : "+2 this week"}
          />
          <StatCard
            title="Transactions"
            value={totalTransactions > 0 ? totalTransactions.toLocaleString() : "0"}
            icon={<TrendingUp className="w-6 h-6" />}
            color="emerald"
            trend={totalTransactions > 0 ? "Today" : undefined}
          />
          <StatCard
            title="Total Liters"
            value={totalLiters > 0 ? totalLiters.toLocaleString('en-IN', {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            }) : "0.0"}
            icon={<Droplet className="w-6 h-6" />}
            color="cyan"
            trend={totalLiters > 0 ? "Today" : undefined}
          />
          <StatCard
            title="Revenue"
            value={totalAmount > 0 ? `PKR ${totalAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : "PKR 0"}
            icon={<DollarSign className="w-6 h-6" />}
            color="violet"
            trend={totalAmount > 0 ? "Today" : undefined}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pumps List */}
          <div className="lg:col-span-1">
            <PumpsList
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onSelectPump={setSelectedPumpId}
            />
          </div>

          {/* Analytics Charts */}
          <div className="lg:col-span-2">
            <AnalyticsCharts pumpId={selectedPumpId} />
          </div>
        </div>
      </main>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
