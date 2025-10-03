import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { eventEmitter } from './useEventListener';

export function useRolePermissions() {
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchRolePermissions() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/role-permissions");
            const data = await response.json();
            setRolePermissions(data);
        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchRolePermissionsByRole(roleId: number) {
        setLoading(true);
        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/role-permissions/role/${roleId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error al obtener permisos del rol:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }

    async function assignPermissionToRole(roleId: number, permissionId: number) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/role-permissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rol_id: roleId, permission_id: permissionId }),
            });
            const data = await response.json();

            if (response.ok) {
                await fetchRolePermissions();
                eventEmitter.emit('data-changed', 'role-permissions');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Permiso asignado',
                    text: data.message,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al asignar permiso',
                    text: data.message || 'Error desconocido',
                });
            }
        } catch (error) {
            console.error("Error al asignar permiso:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al asignar permiso',
            });
        } finally {
            setLoading(false);
        }
    }

    async function assignMultiplePermissions(roleId: number, permissionIds: number[]) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/role-permissions/assign-multiple", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ roleId, permissionIds }),
            });
            const data = await response.json();

            if (response.ok) {
                await fetchRolePermissions();
                eventEmitter.emit('data-changed', 'role-permissions');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Permisos asignados',
                    html: `
                        <p>${data.message}</p>
                        <p>Exitosos: ${data.successful}</p>
                        <p>Fallidos: ${data.failed}</p>
                    `,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al asignar permisos',
                    text: data.message || 'Error desconocido',
                });
            }
        } catch (error) {
            console.error("Error al asignar permisos:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al asignar permisos',
            });
        } finally {
            setLoading(false);
        }
    }

    async function removePermissionFromRole(id: number) {
        setLoading(true);
        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/role-permissions/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (response.ok) {
                await fetchRolePermissions();
                eventEmitter.emit('data-changed', 'role-permissions');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Permiso removido',
                    text: data.message,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al remover permiso',
                    text: data.message || 'Error desconocido',
                });
            }
        } catch (error) {
            console.error("Error al remover permiso:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al remover permiso',
            });
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchRolePermissions();
    };

    useEffect(() => {
        fetchRolePermissions();
    }, []);

    return {
        rolePermissions,
        loading,
        assignPermissionToRole,
        assignMultiplePermissions,
        removePermissionFromRole,
        fetchRolePermissionsByRole,
        refetch
    };
}