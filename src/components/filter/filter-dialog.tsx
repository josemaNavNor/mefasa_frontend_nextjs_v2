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
import { 
  Filter, 
  FilterFormData, 
  FilterCriterionFormData, 
  FilterOperator, 
  LogicalOperator, 
  TicketFilterField 
} from '@/types/filter';
import { toast } from 'sonner';

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
      toast.error('El nombre del filtro es requerido');
      return;
    }

    if (formData.criteria.length === 0) {
      toast.error('Debe agregar al menos un criterio');
      return;
    }

    // Validar que todos los criterios estén completos
    const invalidCriteria = formData.criteria.some(criterion => 
      !criterion.field_name || !criterion.operator || !criterion.value
    );

    if (invalidCriteria) {
      toast.error('Todos los criterios deben estar completos');
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
      success = (await createFilter(filterData)) !== null;
    } else if (mode === 'edit' && filter) {
      success = (await updateFilter(filter.id, filterData)) !== null;
    }

    if (success) {
      toast.success(
        mode === 'create' 
          ? 'Filtro creado correctamente' 
          : 'Filtro actualizado correctamente'
      );
      onClose();
    } else {
      toast.error(
        mode === 'create' 
          ? 'Error al crear el filtro' 
          : 'Error al actualizar el filtro'
      );
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
      criteria: prev.criteria.map((criterion, i) => 
        i === index ? { ...criterion, [field]: value } : criterion
      ),
    }));
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
                        <Input
                          value={criterion.value}
                          onChange={(e) => updateCriterion(index, 'value', e.target.value)}
                          placeholder="Valor a comparar"
                        />
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