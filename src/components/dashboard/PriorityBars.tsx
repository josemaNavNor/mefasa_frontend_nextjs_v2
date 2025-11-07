'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PriorityBarsProps {
  data: Record<string, number>;
}

export function PriorityBars({ data }: PriorityBarsProps) {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
    },
    xaxis: {
      categories: Object.keys(data),
      title: {
        text: 'Prioridad',
      },
    },
    yaxis: {
      title: {
        text: 'Número de Tickets',
      },
      min: 0,
    },
    colors: ['#DC2626', '#F59E0B', '#10B981'], // Rojo, Amarillo, Verde
    tooltip: {
      y: {
        formatter: (value: number) => `${value} tickets`,
      },
    },
  }), [data]);

  const series = useMemo(() => [
    {
      name: 'Tickets',
      data: Object.values(data),
    },
  ], [data]);

  const hasData = Object.values(data).some(value => value > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets por Prioridad</CardTitle>
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
        <CardTitle>Tickets por Prioridad</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height={300}
        />
      </CardContent>
    </Card>
  );
}