'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { pumpsApi } from '@/lib/api';
import type { Pump } from '@/types';

export default function Home() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPumps = async () => {
      try {
        setLoading(true);
        const data = await pumpsApi.getAll();
        setPumps(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError('Failed to load pumps. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };  

    // Fetch immediately
    fetchPumps();

    // Auto-refresh every 10 seconds to get real-time updates
    const interval = setInterval(fetchPumps, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f6] via-[#ffeede] to-[#fffaf5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Dashboard pumps={pumps} />
    </ProtectedRoute>
  );
}

