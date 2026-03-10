'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import NozzleCard from '@/components/NozzleCard';
import { analyticsApi } from '@/lib/api';
import type { NozzleDashboardItem } from '@/types';
import {
  Activity,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Zap,
  Gauge,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NozzleDashboardPage() {
  const [nozzles, setNozzles] = useState<NozzleDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const fetchNozzleData = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getNozzleDashboard();
      setNozzles(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to load nozzle data. ' + errorMessage);
      console.error('Nozzle dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNozzleData();
    const interval = setInterval(fetchNozzleData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen w-full mesh-bg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Loading nozzle dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full mesh-bg">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Left: Back button + Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                    <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
                      Nozzle<span className="text-gradient">View</span>
                    </h1>
                    <p className="text-xs text-slate-500 hidden sm:block">Real-time monitoring</p>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {/* Live Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">Live</span>
                </div>

                <button
                  onClick={fetchNozzleData}
                  className="p-2.5 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                {/* User Avatar */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">{user?.email}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Stats Bar */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="glass-card rounded-2xl px-6 py-4 border border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Active Nozzles</p>
                  <p className="text-3xl font-display font-bold text-slate-900">{nozzles.length}</p>
                </div>
              </div>
            </div>
            {lastUpdated && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 glass-card rounded-2xl border-l-4 border-red-500 p-5">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Nozzle Cards Grid */}
          {nozzles.length === 0 ? (
            <div className="glass-card rounded-2xl border border-slate-200/50 p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Gauge className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No Nozzle Data</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Start sending data from your pumps to see nozzle information here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nozzles.map((nozzle, index) => (
                <NozzleCard key={`${nozzle.pumpId}-${nozzle.nozzle}-${index}`} data={nozzle} />
              ))}
            </div>
          )}
        </main>

        {/* Background Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </ProtectedRoute>
  );
}




