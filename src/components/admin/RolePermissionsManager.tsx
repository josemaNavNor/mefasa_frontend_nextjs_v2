'use client';

import { useState } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, Minus } from 'lucide-react';
//
export default function RolePermissionsManager() {
  const {
    roles,
    groupedPermissions,
    loading,
    error,
    syncRolePermissions,
    getRolePermissionIds,
    setError,
  } = useRolePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedRole = roles.find(role => role.id === selectedRoleId);

  // Manejar selección de rol
  const handleRoleSelect = (roleId: string) => {
    const id = parseInt(roleId);
    setSelectedRoleId(id);
    
    const role = roles.find(r => r.id === id);
    if (role) {
      setSelectedPermissions(getRolePermissionIds(role));
    }
    setError(null);
  };

  // Manejar cambio de permiso individual
  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  // Manejar cambio de módulo completo
  const handleModuleChange = (modulePermissions: number[], checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        // Agregar todos los permisos del módulo que no estén ya seleccionados
        const newPermissions = modulePermissions.filter(id => !prev.includes(id));
        return [...prev, ...newPermissions];
      } else {
        // Remover todos los permisos del módulo
        return prev.filter(id => !modulePermissions.includes(id));
      }
    });
  };

  // Verificar si todos los permisos de un módulo están seleccionados
  const isModuleFullySelected = (modulePermissions: number[]): boolean => {
    return modulePermissions.every(id => selectedPermissions.includes(id));
  };

  // Verificar si algunos permisos de un módulo están seleccionados
  const isModulePartiallySelected = (modulePermissions: number[]): boolean => {
    return modulePermissions.some(id => selectedPermissions.includes(id)) && 
           !isModuleFullySelected(modulePermissions);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!selectedRoleId) return;

    setSaving(true);
    const success = await syncRolePermissions(selectedRoleId, selectedPermissions);
    setSaving(false);

    if (success) {
      // TODO: Reemplazar con un toast notification
      setError(null);
      // Mensaje temporal hasta implementar toast
      const message = `Permisos del rol "${selectedRole?.role_name}" actualizados correctamente`;
      alert(message);
    }
  };

  // Resetear cambios
  const handleReset = () => {
    if (selectedRole) {
      setSelectedPermissions(getRolePermissionIds(selectedRole));
    }
  };

  // Verificar si hay cambios pendientes
  const hasChanges = selectedRole && 
    JSON.stringify(selectedPermissions.sort()) !== 
    JSON.stringify(getRolePermissionIds(selectedRole).sort());

  // if (loading && roles.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center p-8">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //       <span className="ml-2">Cargando roles y permisos...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Permisos por Rol</h2>
          <p className="text-muted-foreground">
            Selecciona un rol y configura sus permisos específicos
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Rol</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRoleId?.toString() || ""} onValueChange={handleRoleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un rol para configurar" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{role.role_name}</span>
                    <Badge variant="outline" className="ml-2">
                      {role.permissions.length} permisos
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRole && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">{selectedRole.role_name}</h3>
              <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permisos actuales: {selectedRole.permissions.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRoleId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configurar Permisos</CardTitle>
              <div className="flex gap-2">
                {hasChanges && (
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !hasChanges}
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {groupedPermissions.map((group) => {
                const modulePermissionIds = group.permissions.map(p => p.id);
                const isFullySelected = isModuleFullySelected(modulePermissionIds);
                const isPartiallySelected = isModulePartiallySelected(modulePermissionIds);

                return (
                  <div key={group.module} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Checkbox
                          id={`module-${group.module}`}
                          checked={isFullySelected}
                          onCheckedChange={(checked) => 
                            handleModuleChange(modulePermissionIds, checked as boolean)
                          }
                        />
                        {isPartiallySelected && (
                          <Minus className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                        )}
                      </div>
                      <label 
                        htmlFor={`module-${group.module}`}
                        className="text-lg font-semibold cursor-pointer"
                      >
                        {group.displayName}
                      </label>
                      <Badge variant={isFullySelected ? "default" : isPartiallySelected ? "secondary" : "outline"}>
                        {modulePermissionIds.filter(id => selectedPermissions.includes(id)).length} / {modulePermissionIds.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {permission.displayName || permission.action}
                          </label>
                        </div>
                      ))}
                    </div>

                    <Separator />
                  </div>
                );
              })}
            </div>

            {hasChanges && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Tienes cambios pendientes. No olvides guardar para aplicar las modificaciones.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
