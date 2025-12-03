'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  metrics?: {
    totalTickets: number;
    openTickets: number;
    closedToday: number;
    pendingLastWeek: number;
    pendingLastWeekDateRange: {
      start: string;
      end: string;
    };
  } | null;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  // Validación defensiva para evitar errores cuando metrics no tiene la estructura esperada
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Formatear fechas para mostrar el rango de la semana pasada con validación
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Validar y proporcionar valores por defecto
  const safeMetrics = {
    totalTickets: metrics.totalTickets || 0,
    openTickets: metrics.openTickets || 0,
    closedToday: metrics.closedToday || 0,
    pendingLastWeek: metrics.pendingLastWeek || 0,
    pendingLastWeekDateRange: metrics.pendingLastWeekDateRange || {
      start: new Date().toISOString(),
      end: new Date().toISOString()
    }
  };

  const lastWeekRange = `${formatDate(safeMetrics.pendingLastWeekDateRange.start)} - ${formatDate(safeMetrics.pendingLastWeekDateRange.end)}`;

  const cards = [
    {
      title: 'Total Tickets',
      value: safeMetrics.totalTickets,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Tickets Abiertos',
      value: safeMetrics.openTickets,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Cerrados Hoy',
      value: safeMetrics.closedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Pendientes Semana Pasada',
      value: safeMetrics.pendingLastWeek,
      subtitle: lastWeekRange,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      isHighlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className={card.isHighlight ? 'border-red-200 dark:border-red-800' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.isHighlight ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {Number(card.value).toLocaleString()}
              </div>
              {card.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}