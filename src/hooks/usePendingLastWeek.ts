import { useState, useEffect } from 'react';
import { api } from '@/lib/httpClient';
import { notifications } from '@/lib/notifications';

export interface PendingLastWeekData {
  tickets: any[];
  totalCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export function usePendingLastWeek() {
  const [data, setData] = useState<PendingLastWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingLastWeekTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tickets/pending-last-week');
      setData(response);
    } catch (err) {
      console.error('Error fetching pending last week tickets:', err);
      setError('Error al cargar tickets pendientes de la semana pasada');
      notifications.error('Error al cargar tickets pendientes de la semana pasada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLastWeekTickets();
  }, []);

  const refetch = () => {
    fetchPendingLastWeekTickets();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}