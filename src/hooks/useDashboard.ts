import { useState, useEffect } from 'react';
import { api } from '@/lib/httpClient';
import Notiflix from 'notiflix';

export interface DashboardData {
  seriesByDate: { date: string; count: number }[];
  countsByStatus: Record<string, number>;
  countsByPriority: Record<string, number>;
  topTechnicians: { name: string; count: number }[];
  metrics: {
    totalTickets: number;
    openTickets: number;
    closedToday: number;
    avgResolutionDays: string;
    pendingLastWeek: number;
    pendingLastWeekDateRange: {
      start: string;
      end: string;
    };
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tickets/dashboard');
      setData(response);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar datos del dashboard');
      Notiflix.Notify.failure('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}