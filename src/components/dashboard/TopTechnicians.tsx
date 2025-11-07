'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopTechniciansProps {
  data: { name: string; count: number }[];
}

export function TopTechnicians({ data }: TopTechniciansProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-500">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Técnicos (Tickets Asignados)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((technician, index) => (
            <div
              key={technician.name}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {technician.name}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold">
                {technician.count} tickets
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}