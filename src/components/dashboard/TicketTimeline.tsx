'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Importación dinámica para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TicketTimelineProps {
  data: { date: string; count: number }[];
}

export function TicketTimeline({ data }: TicketTimelineProps) {
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
      categories: data.map(item => {
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
          const date = new Date(data[dataPointIndex]?.date);
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
  }), [data]);

  const series = useMemo(() => [
    {
      name: 'Tickets Creados',
      data: data.map(item => item.count),
    },
  ], [data]);

  if (!data || data.length === 0) {
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