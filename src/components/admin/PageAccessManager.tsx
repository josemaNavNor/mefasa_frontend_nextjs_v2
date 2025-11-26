'use client';

import { useState, useEffect } from 'react';
import { type Page } from '@/hooks/usePages';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { api } from '@/lib/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { notifications } from '@/lib/notifications';

export default function PageAccessManager() {
  const { roles, loading: rolesLoading } = useRolePermissions();
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageRoles, setPageRoles] = useState<Record<number, number[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las páginas (no solo las del usuario)
  useEffect(() => {
    const loadAllPages = async () => {
      try {
        setPagesLoading(true);
        const data = await api.get('/pages');
        setAllPages(data);
      } catch (err) {
        console.error('Error loading pages:', err);
        setAllPages([]);
      } finally {
        setPagesLoading(false);
      }
    };
    loadAllPages();
  }, []);

  // Cargar relaciones página-rol
  useEffect(() => {
    const loadPageRoles = async () => {
      try {
        const rolesMap: Record<number, number[]> = {};
        
        for (const page of allPages) {
          try {
            const roles = await api.get(`/pages/${page.id}/roles`);
            rolesMap[page.id] = roles.map((r: { id: number }) => r.id);
          } catch (err) {
            console.error(`Error loading roles for page ${page.id}:`, err);
            rolesMap[page.id] = [];
          }
        }
        
        setPageRoles(rolesMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar relaciones');
      }
    };

    if (allPages.length > 0) {
      loadPageRoles();
    }
  }, [allPages]);

  // Manejar cambio de checkbox
  const handleRoleToggle = (pageId: number, roleId: number, checked: boolean) => {
    setPageRoles(prev => {
      const currentRoles = prev[pageId] || [];
      if (checked) {
        return {
          ...prev,
          [pageId]: [...currentRoles, roleId],
        };
      } else {
        return {
          ...prev,
          [pageId]: currentRoles.filter(id => id !== roleId),
        };
      }
    });
  };

  // Verificar si un rol está asignado a una página
  const isRoleAssigned = (pageId: number, roleId: number): boolean => {
    return (pageRoles[pageId] || []).includes(roleId);
  };

  // Verificar si hay cambios pendientes
  const hasChanges = (pageId: number): boolean => {
    // Esta función se puede mejorar comparando con el estado original
    return true; // Por simplicidad, siempre permitimos guardar
  };

  // Función para recargar todas las páginas
  const reloadPages = async () => {
    try {
      setPagesLoading(true);
      const data = await api.get('/pages');
      setAllPages(data);
      
      // Recargar también las relaciones página-rol
      const rolesMap: Record<number, number[]> = {};
      for (const page of data) {
        try {
          const roles = await api.get(`/pages/${page.id}/roles`);
          rolesMap[page.id] = roles.map((r: { id: number }) => r.id);
        } catch (err) {
          console.error(`Error loading roles for page ${page.id}:`, err);
          rolesMap[page.id] = [];
        }
      }
      setPageRoles(rolesMap);
    } catch (err) {
      console.error('Error reloading pages:', err);
    } finally {
      setPagesLoading(false);
    }
  };

  // Guardar cambios de una página específica
  const handleSavePage = async (pageId: number) => {
    try {
      setSaving(true);
      const roleIds = pageRoles[pageId] || [];
      await api.post(`/pages/${pageId}/roles`, { roleIds });
      notifications.success('Acceso a página actualizado correctamente');
      await reloadPages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      notifications.error(`Error al guardar: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Guardar todos los cambios
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      const savePromises = Object.keys(pageRoles).map(pageId =>
        api.post(`/pages/${pageId}/roles`, { roleIds: pageRoles[parseInt(pageId)] })
      );

      await Promise.all(savePromises);
      notifications.success('Todos los cambios guardados correctamente');
      await reloadPages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      notifications.error(`Error al guardar: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Resetear cambios de una página
  const handleResetPage = async (pageId: number) => {
    try {
      const roles = await api.get(`/pages/${pageId}/roles`);
      setPageRoles(prev => ({
        ...prev,
        [pageId]: roles.map((r: { id: number }) => r.id),
      }));
    } catch (err) {
      console.error('Error resetting page:', err);
    }
  };

  const loading = pagesLoading || rolesLoading;

  if (loading && allPages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando páginas y roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Acceso a Páginas</h2>
          <p className="text-muted-foreground">
            Configura qué roles pueden acceder a cada página del sistema
          </p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={saving}
          size="sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Todos
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {allPages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <Badge variant="outline">{page.path}</Badge>
                  {!page.is_active && (
                    <Badge variant="secondary">Inactiva</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPage(page.id)}
                    disabled={saving}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                  <Button
                    onClick={() => handleSavePage(page.id)}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`page-${page.id}-role-${role.id}`}
                      checked={isRoleAssigned(page.id, role.id)}
                      onCheckedChange={(checked) =>
                        handleRoleToggle(page.id, role.id, checked as boolean)
                      }
                      disabled={!page.is_active}
                    />
                    <label
                      htmlFor={`page-${page.id}-role-${role.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {role.role_name}
                    </label>
                  </div>
                ))}
              </div>
              {pageRoles[page.id] && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {pageRoles[page.id].length} de {roles.length} roles asignados
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allPages.length === 0 && !loading && (
        <Alert>
          <AlertDescription>
            No hay páginas configuradas. Ejecuta el seeder de páginas en el backend.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

