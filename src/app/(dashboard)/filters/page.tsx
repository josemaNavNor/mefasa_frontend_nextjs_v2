'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, StarOff } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useUserFavFilters } from '@/hooks/useUserFavFilters';
import { FilterDialog, FilterDetailDialog } from '@/components/filter';
import { Filter } from '@/types/filter';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';

export default function FiltersPage() {
  const { filters, loading, error, deleteFilter } = useFilters();
  const { 
    isFilterFavorite, 
    toggleFavorite, 
    loading: favLoading 
  } = useUserFavFilters();
  
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleDelete = async (filter: Filter) => {
    Confirm.show(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el filtro "${filter.filter_name}"?`,
      'Sí, eliminar',
      'Cancelar',
      async () => {
        const success = await deleteFilter(filter.id);
        if (success) {
          Notify.success('Filtro eliminado correctamente');
        } else {
          Notify.failure('Error al eliminar el filtro');
        }
      },
      () => {
        // Usuario canceló, no hacer nada
      },
      {
        okButtonBackground: '#ef4444',
        titleColor: '#ef4444',
      }
    );
  };

  const handleEdit = (filter: Filter) => {
    setSelectedFilter(filter);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (filter: Filter) => {
    setSelectedFilter(filter);
    setIsDetailDialogOpen(true);
  };

  const handleToggleFavorite = async (filter: Filter) => {
    // toggleFavorite ahora devuelve 'added' | 'removed' | null
    const result = await toggleFavorite(filter.id);
    if (result === 'added') {
      Notify.success('Filtro agregado a favoritos');
    } else if (result === 'removed') {
      Notify.success('Filtro removido de favoritos');
    } else {
      Notify.failure('Error al actualizar favoritos');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando filtros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Filtros</h1>
          <p className="text-muted-foreground">
            Crea, edita y administra tus filtros personalizados
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Filtro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => (
          <Card key={filter.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {filter.filter_name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {filter.description || 'Sin descripción'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(filter)}
                  disabled={favLoading}
                  className="shrink-0 ml-2"
                >
                  {isFilterFavorite(filter.id) ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {filter.is_public && (
                  <Badge variant="secondary">Público</Badge>
                )}
                {filter.is_system_default && (
                  <Badge variant="default">Sistema</Badge>
                )}
                {filter.filterCriteria && (
                  <Badge variant="outline">
                    {filter.filterCriteria.length} criterio(s)
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(filter)}
                  className="flex-1"
                >
                  Ver Detalles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(filter)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(filter)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No hay filtros disponibles</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear tu primer filtro
          </Button>
        </div>
      )}

      {/* Diálogos */}
      <FilterDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        mode="create"
      />

      <FilterDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedFilter(null);
        }}
        mode="edit"
        filter={selectedFilter}
      />

      <FilterDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedFilter(null);
        }}
        filter={selectedFilter}
      />
    </div>
  );
}