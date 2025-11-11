'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { TicketTimeline } from './TicketTimeline';
import { StatusDonut } from './StatusDonut';
import { PriorityBars } from './PriorityBars';
import { TopTechnicians } from './TopTechnicians';
import { MetricsCards } from './MetricsCards';
import { PendingLastWeekTickets } from './PendingLastWeekTickets';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function TicketsDashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard de Tickets
          </h1>
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Skeleton para métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Skeleton para gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        {/* Skeleton para tickets pendientes */}
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard de Tickets
          </h1>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Dashboard de Tickets
        </h1>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard de Tickets
        </h1>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Métricas principales */}
      <MetricsCards metrics={data.metrics} />

      {/* Tickets pendientes de la semana pasada - Componente destacado */}
      {data.metrics.pendingLastWeek > 0 && <PendingLastWeekTickets />}

      {/* Gráfica principal - Timeline */}
      <TicketTimeline data={data.seriesByDate} />

      {/* Segunda fila de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDonut data={data.countsByStatus} />
        <PriorityBars data={data.countsByPriority} />
      </div>

      {/* Top técnicos */}
      <TopTechnicians data={data.topTechnicians} />
    </div>
  );
}