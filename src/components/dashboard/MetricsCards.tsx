'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
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

export function MetricsCards({ metrics }: MetricsCardsProps) {
  // Formatear fechas para mostrar el rango de la semana pasada
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const lastWeekRange = `${formatDate(metrics.pendingLastWeekDateRange.start)} - ${formatDate(metrics.pendingLastWeekDateRange.end)}`;

  const cards = [
    {
      title: 'Total Tickets',
      value: metrics.totalTickets,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Tickets Abiertos',
      value: metrics.openTickets,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Cerrados Hoy',
      value: metrics.closedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Promedio Resolución',
      value: `${metrics.avgResolutionDays} días`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      isText: true,
    },
    {
      title: 'Pendientes Semana Pasada',
      value: metrics.pendingLastWeek,
      subtitle: lastWeekRange,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      isHighlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                {card.isText ? card.value : Number(card.value).toLocaleString()}
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