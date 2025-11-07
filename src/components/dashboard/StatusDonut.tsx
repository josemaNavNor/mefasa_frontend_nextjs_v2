'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatusDonutProps {
  data: Record<string, number>;
}

export function StatusDonut({ data }: StatusDonutProps) {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'donut' as const,
    },
    labels: Object.keys(data),
    colors: ['#10B981', '#F59E0B', '#EF4444'], // Verde, Amarillo, Rojo
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => {
                const total = Object.values(data).reduce((sum, val) => sum + val, 0);
                return total.toString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} tickets`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }), [data]);

  const series = useMemo(() => Object.values(data), [data]);

  const hasData = Object.values(data).some(value => value > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
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
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={chartOptions}
          series={series}
          type="donut"
          height={300}
        />
      </CardContent>
    </Card>
  );
}