'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Filter as FilterIcon, X } from 'lucide-react';
import { useUserFavFilters } from '@/hooks/useUserFavFilters';
import { Filter } from '@/types/filter';

interface FavoriteFiltersProps {
  onApplyFilter: (filter: Filter) => void;
  activeFilter: Filter | null;
  onClearFilter: () => void;
}

export function FavoriteFilters({ onApplyFilter, activeFilter, onClearFilter }: FavoriteFiltersProps) {
  const { userFavFilters, loading, error } = useUserFavFilters();
  const [collapsed, setCollapsed] = useState(false);

  const favoriteFilters = userFavFilters
    .map(favFilter => favFilter.filter)
    .filter((filter): filter is Filter => filter !== undefined);

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Filtros Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Filtros Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error al cargar filtros</p>
        </CardContent>
      </Card>
    );
  }

  if (favoriteFilters.length === 0) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Filtros Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No tienes filtros favoritos aún.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ve a la sección de Filtros para crear algunos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Filtros Favoritos
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▼' : '▲'}
          </Button>
        </div>
        {activeFilter && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              <FilterIcon className="h-3 w-3 mr-1" />
              Activo: {activeFilter.filter_name}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilter}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent>
          <div className="h-[300px] overflow-y-auto">
            <div className="space-y-2">
              {favoriteFilters.map((filter) => (
                <div
                  key={filter.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    activeFilter?.id === filter.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => onApplyFilter(filter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {filter.filter_name}
                      </h4>
                      {filter.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {filter.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {filter.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Público
                      </Badge>
                    )}
                    {filter.filterCriteria && (
                      <Badge variant="outline" className="text-xs">
                        {filter.filterCriteria.length} criterio(s)
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}