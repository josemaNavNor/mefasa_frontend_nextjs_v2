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

export function useDashboard(initialData?: DashboardData | null) {
  const [data, setData] = useState<DashboardData | null>(initialData ?? null);
  // Si hay initialData, empezar con loading=false, si no, empezar con loading=true
  const [loading, setLoading] = useState(!initialData);
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
    // Si ya tenemos datos iniciales (SSR/ISR), no es necesario hacer la primera petición
    if (!initialData) {
      fetchDashboardData();
    } else {
      // Asegurar que loading sea false si tenemos datos
      setLoading(false);
    }
  }, [fetchDashboardData, initialData]);

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