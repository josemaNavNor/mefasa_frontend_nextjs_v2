import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/httpClient';
import { notifications } from '@/lib/notifications';

export interface DashboardData {
  seriesByDate: { date: string; count: number }[];
  countsByStatus: Record<string, number>;
  topTechnicians: { name: string; count: number }[];
  metrics: {
    totalTickets: number;
    openTickets: number;
    closedToday: number;
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tickets/dashboard');
      setData(response);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar datos del dashboard');
      notifications.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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