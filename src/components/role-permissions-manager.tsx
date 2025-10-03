"use client";

import { useState, useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/use_RolePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function RolePermissionsManager() {
    const { roles } = useRoles();
    const { permissions } = usePermissions();
    const { 
        assignPermissionToRole, 
        removePermissionFromRole, 
        fetchRolePermissionsByRole,
        assignMultiplePermissions 
    } = useRolePermissions();
    
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Cargar permisos del rol seleccionado
    useEffect(() => {
        if (selectedRoleId) {
            loadRolePermissions();
        }
    }, [selectedRoleId]);

    const loadRolePermissions = async () => {
        if (!selectedRoleId) return;
        
        setLoading(true);
        try {
            const data = await fetchRolePermissionsByRole(selectedRoleId);
            setRolePermissions(data);
            const permissionIds = data.map((rp: any) => rp.permission_id);
            setSelectedPermissions(permissionIds);
        } catch (error) {
            console.error("Error cargando permisos del rol:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (permissionId: number, checked: boolean) => {
        if (checked) {
            setSelectedPermissions(prev => [...prev, permissionId]);
        } else {
            setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedRoleId) return;

        const currentPermissionIds = rolePermissions.map(rp => rp.permission_id);
        const toAdd = selectedPermissions.filter(id => !currentPermissionIds.includes(id));
        const toRemove = rolePermissions.filter(rp => !selectedPermissions.includes(rp.permission_id));

        // Agregar nuevos permisos
        if (toAdd.length > 0) {
            await assignMultiplePermissions(selectedRoleId, toAdd);
        }

        // Remover permisos deseleccionados
        for (const rp of toRemove) {
            await removePermissionFromRole(rp.id);
        }

        // Recargar permisos
        await loadRolePermissions();
    };

    // Agrupar permisos por módulo
    const permissionsByModule = permissions.reduce((acc: any, permission: any) => {
        const moduleName = permission.moduleEntity?.name || 'Sin Módulo';
        if (!acc[moduleName]) {
            acc[moduleName] = [];
        }
        acc[moduleName].push(permission);
        return acc;
    }, {});

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Permisos por Rol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="role-select" className="mb-2">Seleccionar Rol</Label>
                        <Select
                            value={selectedRoleId?.toString() || ""}
                            onValueChange={(value) => setSelectedRoleId(Number(value))}
                        >
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.rol_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedRoleId && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Permisos Disponibles</h3>
                                <Button onClick={handleSaveChanges} disabled={loading}>
                                    {loading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {Object.entries(permissionsByModule).map(([moduleName, modulePermissions]: [string, any]) => (
                                    <Card key={moduleName} className="p-4">
                                        <h4 className="font-medium mb-3 text-blue-600">{moduleName}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {modulePermissions.map((permission: any) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={selectedPermissions.includes(permission.id)}
                                                        onCheckedChange={(checked) => 
                                                            handlePermissionToggle(permission.id, checked as boolean)
                                                        }
                                                    />
                                                    <Label 
                                                        htmlFor={`permission-${permission.id}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {permission.perm_name}
                                                        {permission.description && (
                                                            <span className="text-xs text-gray-500 block">
                                                                {permission.description}
                                                            </span>
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}