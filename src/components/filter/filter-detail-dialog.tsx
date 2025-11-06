'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, TicketFilterField, FilterOperator, LogicalOperator } from '@/types/filter';

interface FilterDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filter: Filter | null;
}

const fieldLabels: Record<string, string> = {
  [TicketFilterField.TITLE]: 'Título',
  [TicketFilterField.DESCRIPTION]: 'Descripción',
  [TicketFilterField.STATUS]: 'Estado',
  [TicketFilterField.PRIORITY]: 'Prioridad',
  [TicketFilterField.TYPE_ID]: 'Tipo de Ticket',
  [TicketFilterField.FLOOR_ID]: 'Planta',
  [TicketFilterField.ASSIGNED_TO]: 'Asignado a',
  [TicketFilterField.CREATED_BY]: 'Creado por',
  [TicketFilterField.CREATED_AT]: 'Fecha de creación',
  [TicketFilterField.UPDATED_AT]: 'Fecha de actualización',
};

const operatorLabels: Record<string, string> = {
  [FilterOperator.EQUALS]: 'Igual a',
  [FilterOperator.NOT_EQUALS]: 'No igual a',
  [FilterOperator.CONTAINS]: 'Contiene',
  [FilterOperator.NOT_CONTAINS]: 'No contiene',
  [FilterOperator.STARTS_WITH]: 'Empieza con',
  [FilterOperator.ENDS_WITH]: 'Termina con',
  [FilterOperator.GREATER_THAN]: 'Mayor que',
  [FilterOperator.LESS_THAN]: 'Menor que',
  [FilterOperator.GREATER_EQUAL]: 'Mayor o igual que',
  [FilterOperator.LESS_EQUAL]: 'Menor o igual que',
  [FilterOperator.IN]: 'En lista',
  [FilterOperator.NOT_IN]: 'No en lista',
  [FilterOperator.IS_NULL]: 'Es nulo',
  [FilterOperator.IS_NOT_NULL]: 'No es nulo',
};

export function FilterDetailDialog({ isOpen, onClose, filter }: FilterDetailDialogProps) {
  if (!filter) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles del Filtro
            <div className="flex gap-2">
              {filter.is_public && (
                <Badge variant="secondary">Público</Badge>
              )}
              {filter.is_system_default && (
                <Badge variant="default">Sistema</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Nombre</h4>
                <p className="text-lg font-semibold">{filter.filter_name}</p>
              </div>
              
              {filter.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Descripción</h4>
                  <p className="text-sm">{filter.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-muted-foreground">Creado</h4>
                  <p>{formatDate(filter.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Actualizado</h4>
                  <p>{formatDate(filter.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criterios de filtrado */}
          {filter.filterCriteria && filter.filterCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Criterios de Filtrado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filter.filterCriteria.map((criterion, index) => (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Criterio {index + 1}</Badge>
                        {index > 0 && (
                          <Badge 
                            variant={criterion.logical_operator === LogicalOperator.AND ? "default" : "secondary"}
                          >
                            {criterion.logical_operator === LogicalOperator.AND ? 'Y (AND)' : 'O (OR)'}
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">Campo:</span>
                          <span>{fieldLabels[criterion.field_name] || criterion.field_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">Operador:</span>
                          <span>{operatorLabels[criterion.operator] || criterion.operator}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">Valor:</span>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {criterion.value}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadatos adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Filtro público</span>
                  <Badge variant={filter.is_public ? "default" : "secondary"}>
                    {filter.is_public ? 'Sí' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Filtro del sistema</span>
                  <Badge variant={filter.is_system_default ? "default" : "secondary"}>
                    {filter.is_system_default ? 'Sí' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">ID del filtro</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {filter.id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}