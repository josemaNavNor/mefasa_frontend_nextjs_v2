'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TicketTimelineProps {
  data?: { date: string; count: number }[] | null;
}

export function TicketTimeline({ data }: TicketTimelineProps) {
  // Validar que data existe y es un array antes de usarlo
  const safeData = data && Array.isArray(data) ? data : [];

  const chartOptions = useMemo(() => ({
    chart: {
      id: 'tickets-timeline',
      type: 'area' as const,
      height: 350,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: safeData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      }),
      title: {
        text: 'Fecha',
      },
    },
    yaxis: {
      title: {
        text: 'Número de Tickets',
      },
      min: 0,
    },
    tooltip: {
      x: {
        formatter: (value: any, { dataPointIndex }: any) => {
          const dateValue = safeData[dataPointIndex]?.date;
          if (!dateValue) return 'Fecha no disponible';
          const date = new Date(dateValue);
          return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      },
    },
    colors: ['#3B82F6'],
  }), [safeData]);

  const series = useMemo(() => [
    {
      name: 'Tickets Creados',
      data: safeData.map(item => item.count),
    },
  ], [safeData]);

  if (!safeData || safeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets por Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets Creados (Últimos 30 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={chartOptions}
          series={series}
          type="area"
          height={350}
        />
      </CardContent>
    </Card>
  );
}