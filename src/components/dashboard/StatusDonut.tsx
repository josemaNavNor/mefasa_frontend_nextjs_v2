'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Cargando gráfico...</div>
});

interface StatusDonutProps {
  data?: Record<string, number> | null;
}

export function StatusDonut({ data }: StatusDonutProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validar que data existe y es un objeto antes de usarlo
  const safeData = data && typeof data === 'object' ? data : {};

  const chartOptions = useMemo(() => ({
    chart: {
      type: 'donut' as const,
    },
    labels: Object.keys(safeData),
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
                const total = Object.values(safeData).reduce((sum, val) => sum + val, 0);
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
  }), [safeData]);

  const series = useMemo(() => Object.values(safeData), [safeData]);

  const hasData = Object.values(safeData).some(value => value > 0);

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
        {isMounted ? (
          <Suspense fallback={
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Cargando gráfico...
            </div>
          }>
            <Chart
              options={chartOptions}
              series={series}
              type="donut"
              height={300}
            />
          </Suspense>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Cargando gráfico...
          </div>
        )}
      </CardContent>
    </Card>
  );
}