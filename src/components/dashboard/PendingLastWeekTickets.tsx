'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePendingLastWeek } from '@/hooks/usePendingLastWeek';
import { AlertTriangle, Calendar, User, RefreshCw, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface PendingTicket {
  id: number;
  ticket_number: string;
  summary: string;
  status: string;
  priority: string;
  end_user: string;
  created_at: string;
  technician?: {
    name: string;
    last_name: string;
  };
  floor?: {
    floor_name: string;
  };
  type?: {
    type_name: string;
  };
  isNew?: boolean;
}

export function PendingLastWeekTickets() {
  const { data, loading, error, refetch } = usePendingLastWeek();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tickets Pendientes Semana Pasada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tickets Pendientes Semana Pasada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600" />
            Tickets Pendientes Semana Pasada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-green-600 text-lg font-medium">
              ¡Excelente! No hay tickets pendientes de la semana pasada
            </p>
            {data?.dateRange && (
              <p className="text-gray-500 text-sm mt-2">
                Del {new Date(data.dateRange.start).toLocaleDateString('es-ES')} al {new Date(data.dateRange.end).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar solo los primeros 3 tickets en la vista principal
  const displayedTickets = data.tickets.slice(0, 3);

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tickets Pendientes Semana Pasada
            <Badge variant="destructive" className="ml-2">
              {data.totalCount}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {data.totalCount > 3 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver todos ({data.totalCount})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>
                      Todos los Tickets Pendientes de la Semana Pasada
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                      Del {new Date(data.dateRange.start).toLocaleDateString('es-ES')} al {new Date(data.dateRange.end).toLocaleDateString('es-ES')}
                    </p>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <div className="space-y-3">
                      {data.tickets.map((ticket: PendingTicket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Del {new Date(data.dateRange.start).toLocaleDateString('es-ES')} al {new Date(data.dateRange.end).toLocaleDateString('es-ES')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedTickets.map((ticket: PendingTicket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          
          {data.totalCount > 3 && (
            <div className="pt-2 border-t">
              <p className="text-center text-sm text-gray-500">
                y {data.totalCount - 3} tickets más...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TicketCard({ ticket }: { ticket: PendingTicket }) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'baja': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'abierto': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'en progreso': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
      ticket.isNew ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {ticket.ticket_number}
            </span>
            {ticket.isNew && (
              <Badge variant="outline" className="text-xs">
                Nuevo
              </Badge>
            )}
          </div>
          
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
            {ticket.summary}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {ticket.end_user}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(ticket.created_at).toLocaleDateString('es-ES')}
            </div>
            {ticket.technician && (
              <span className="text-xs">
                Técnico: {ticket.technician.name} {ticket.technician.last_name}
              </span>
            )}
          </div>
          
          {(ticket.floor || ticket.type) && (
            <div className="flex gap-2 mt-2">
              {ticket.floor && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {ticket.floor.floor_name}
                </span>
              )}
              {ticket.type && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {ticket.type.type_name}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </Badge>
          <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </Badge>
        </div>
      </div>
    </div>
  );
}