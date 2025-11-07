'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useFloors } from '@/hooks/use_floors';
import { useType } from '@/hooks/use_typeTickets';
import { useUsers } from '@/hooks/useUsersAdmin';
import { 
  Filter, 
  FilterFormData, 
  FilterCriterionFormData, 
  FilterOperator, 
  LogicalOperator, 
  TicketFilterField 
} from '@/types/filter';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  filter?: Filter | null;
}

const defaultCriterion: FilterCriterionFormData = {
  field_name: '',
  operator: '',
  value: '',
  logical_operator: LogicalOperator.AND,
};

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

export function FilterDialog({ isOpen, onClose, mode, filter }: FilterDialogProps) {
  const { createFilter, updateFilter, loading } = useFilters();
  const { floors } = useFloors();
  const { types } = useType();
  const { users } = useUsers();
  
  const [formData, setFormData] = useState<FilterFormData>({
    filter_name: '',
    description: '',
    is_public: false,
    criteria: [{ ...defaultCriterion }],
  });

  useEffect(() => {
    if (mode === 'edit' && filter) {
      setFormData({
        filter_name: filter.filter_name,
        description: filter.description || '',
        is_public: filter.is_public,
        criteria: filter.filterCriteria?.map(criterion => ({
          field_name: criterion.field_name,
          operator: criterion.operator,
          value: criterion.value,
          logical_operator: criterion.logical_operator,
        })) || [{ ...defaultCriterion }],
      });
    } else if (mode === 'create') {
      setFormData({
        filter_name: '',
        description: '',
        is_public: false,
        criteria: [{ ...defaultCriterion }],
      });
    }
  }, [mode, filter, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.filter_name.trim()) {
      Notify.failure('El nombre del filtro es requerido');
      return;
    }

    // Validar que todos los criterios estén completos
    const incompleteCriteria = formData.criteria.filter(criterion => {
      // Los operadores IS_NULL e IS_NOT_NULL no necesitan valor
      const operatorsWithoutValue = [FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL];
      const needsValue = !operatorsWithoutValue.includes(criterion.operator as FilterOperator);
      
      return !criterion.field_name || !criterion.operator || (needsValue && !criterion.value);
    });

    if (incompleteCriteria.length > 0) {
      Notify.failure('Todos los criterios deben estar completos (campo, operador y valor)');
      return;
    }

    const filterData = {
      filter_name: formData.filter_name,
      description: formData.description,
      is_public: formData.is_public,
      is_system_default: false,
      filterCriteria: formData.criteria.map(criterion => ({
        field_name: criterion.field_name,
        operator: criterion.operator,
        value: criterion.value,
        logical_operator: criterion.logical_operator,
      })),
    };

    let success = false;
    if (mode === 'create') {
      const result = await createFilter(filterData);
      success = result !== null;
      if (!success) {
        // El error ya se muestra en el hook
        return;
      }
    } else if (mode === 'edit' && filter) {
      const result = await updateFilter(filter.id, filterData);
      success = result !== null;
      if (!success) {
        // El error ya se muestra en el hook
        return;
      }
    }

    if (success) {
      Notify.success(
        mode === 'create' 
          ? 'Filtro creado correctamente con todos sus criterios' 
          : 'Filtro actualizado correctamente'
      );
      onClose();
    }
  };

  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { ...defaultCriterion }],
    }));
  };

  const removeCriterion = (index: number) => {
    if (formData.criteria.length > 1) {
      setFormData(prev => ({
        ...prev,
        criteria: prev.criteria.filter((_, i) => i !== index),
      }));
    }
  };

  const updateCriterion = (index: number, field: keyof FilterCriterionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, i) => {
        if (i === index) {
          const updatedCriterion = { ...criterion, [field]: value };
          
          // Si se cambia el operador a uno que no necesita valor, limpiar el valor
          if (field === 'operator' && !shouldShowValue(value)) {
            updatedCriterion.value = '';
          }
          
          // Si es un campo de fecha y se está actualizando el valor, convertir a formato correcto
          if (field === 'value' && shouldShowDateInput(criterion.field_name) && value) {
            // Para fechas, necesitamos manejar diferentes operadores
            if (criterion.operator === FilterOperator.EQUALS) {
              // Para "igual a", buscar todo el día: desde 00:00:00 hasta 23:59:59
              updatedCriterion.value = value; // Guardamos solo la fecha, el backend manejará el rango
            } else {
              // Para otros operadores, mantener la fecha tal como está
              updatedCriterion.value = value;
            }
          }
          
          return updatedCriterion;
        }
        return criterion;
      }),
    }));
  };

  const getFieldOptions = (fieldName: string) => {
    switch (fieldName) {
      case TicketFilterField.FLOOR_ID:
        return floors.map(floor => ({ value: floor.id.toString(), label: floor.floor_name }));
      case TicketFilterField.TYPE_ID:
        return types.map(type => ({ value: type.id.toString(), label: type.type_name }));
      case TicketFilterField.ASSIGNED_TO:
        return users.map(user => ({ value: user.id.toString(), label: `${user.name} ${user.last_name}` }));
      case TicketFilterField.STATUS:
        return [
          { value: 'Abierto', label: 'Abierto' },
          { value: 'En Progreso', label: 'En Progreso' },
          { value: 'Cerrado', label: 'Cerrado' }
        ];
      case TicketFilterField.PRIORITY:
        return [
          { value: 'Baja', label: 'Baja' },
          { value: 'Media', label: 'Media' },
          { value: 'Alta', label: 'Alta' }
        ];
      default:
        return [];
    }
  };

  const shouldShowDropdown = (fieldName: string) => {
    return [
      TicketFilterField.FLOOR_ID,
      TicketFilterField.TYPE_ID,
      TicketFilterField.ASSIGNED_TO,
      // Removemos CREATED_BY para que use input de texto
      TicketFilterField.STATUS,
      TicketFilterField.PRIORITY
    ].includes(fieldName as TicketFilterField);
  };

  const shouldShowDateInput = (fieldName: string) => {
    return [
      TicketFilterField.CREATED_AT,
      TicketFilterField.UPDATED_AT
    ].includes(fieldName as TicketFilterField);
  };

  const shouldShowValue = (operator: string) => {
    const operatorsWithoutValue = [FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL];
    return !operatorsWithoutValue.includes(operator as FilterOperator);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Nuevo Filtro' : 'Editar Filtro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del filtro */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="filter_name">Nombre del Filtro *</Label>
              <Input
                id="filter_name"
                value={formData.filter_name}
                onChange={(e) => setFormData(prev => ({ ...prev, filter_name: e.target.value }))}
                placeholder="Ej: Tickets Urgentes"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="is_public">Filtro público</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del filtro..."
              rows={3}
            />
          </div>

          {/* Criterios de filtrado */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Criterios de Filtrado</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Criterio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.criteria.map((criterion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Criterio {index + 1}</Badge>
                      {formData.criteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriterion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <Label>Campo</Label>
                        <Select
                          value={criterion.field_name}
                          onValueChange={(value) => updateCriterion(index, 'field_name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(fieldLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Operador</Label>
                        <Select
                          value={criterion.operator}
                          onValueChange={(value) => updateCriterion(index, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar operador" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(operatorLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Valor</Label>
                        {!shouldShowValue(criterion.operator) ? (
                          <Input
                            type="text"
                            value="(No requerido)"
                            disabled
                            className="bg-gray-100 text-gray-500"
                          />
                        ) : shouldShowDropdown(criterion.field_name) ? (
                          <Select
                            value={criterion.value}
                            onValueChange={(value) => updateCriterion(index, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar valor" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldOptions(criterion.field_name).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : shouldShowDateInput(criterion.field_name) ? (
                          <Input
                            type="date"
                            value={criterion.value ? criterion.value.split('T')[0] : ''}
                            onChange={(e) => updateCriterion(index, 'value', e.target.value)}
                            placeholder="Seleccionar fecha"
                          />
                        ) : (
                          <Input
                            type="text"
                            value={criterion.value}
                            onChange={(e) => updateCriterion(index, 'value', e.target.value)}
                            placeholder={
                              criterion.field_name === TicketFilterField.CREATED_BY 
                                ? "Email del usuario" 
                                : "Valor a comparar"
                            }
                          />
                        )}
                      </div>

                      {index > 0 && (
                        <div>
                          <Label>Operador Lógico</Label>
                          <Select
                            value={criterion.logical_operator}
                            onValueChange={(value) => updateCriterion(index, 'logical_operator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={LogicalOperator.AND}>Y (AND)</SelectItem>
                              <SelectItem value={LogicalOperator.OR}>O (OR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Filtro' : 'Actualizar Filtro')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}