import { useState, useEffect } from "react"
import { api } from '@/lib/httpClient'
import { notifications } from '@/lib/notifications';
import { eventEmitter } from './useEventListener'
import { ROLE_EVENTS, GLOBAL_EVENTS } from '@/lib/events'

export function useRoles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchRoles() {
        setLoading(true);
        try {
            const response = await api.get('/roles');
            if (Array.isArray(response)) {
                setRoles(response);
            } else if (response && Array.isArray(response.roles)) {
                setRoles(response.roles);
            } else {
                console.error('Unexpected data structure:', response);
                setRoles([]);
            }
        } catch (error) {
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }

    async function createRole(role: { role_name: string, description: string }) {
        setLoading(true);
        try {
            const data = await api.post('/roles', role);
            setRoles((prevRoles) => [...prevRoles, data]);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'roles');
            eventEmitter.emit(GLOBAL_EVENTS.ROLES_UPDATED);
            notifications.success(`Rol ${role.role_name} creado correctamente`);
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                throw error;
            }
            //console.error("Error al crear el rol:", error);
            notifications.error(
                error instanceof Error ? `Error al crear el rol: ${error.message}` : 'Error al crear el rol: Error desconocido'
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateRole(id: number, role: { role_name?: string, description?: string }) {
        setLoading(true);
        try {
            const response = await api.patch(`/roles/${id}`, role);
            setRoles((prevRoles) =>
                prevRoles.map((r) => (r.id === id ? { ...r, ...response } : r))
            );
            // Emitir eventos específicos para roles
            eventEmitter.emit(ROLE_EVENTS.UPDATED, { id, data: response });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'roles');
            eventEmitter.emit(GLOBAL_EVENTS.ROLES_UPDATED);
            notifications.success(`Rol ${role.role_name ?? ''} actualizado correctamente`);
            return response;
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                return null;
            }
            //console.error("Error al actualizar el rol:", error);
            notifications.error(
                error instanceof Error ? `Error al actualizar el rol: ${error.message}` : 'Error al actualizar el rol: Error desconocido'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function deleteRole(id: number) {
        setLoading(true);
        try {
            await api.delete(`/roles/${id}`);
            setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
            // Emitir eventos específicos para roles
            eventEmitter.emit(ROLE_EVENTS.DELETED, { id });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'roles');
            eventEmitter.emit(GLOBAL_EVENTS.ROLES_UPDATED);
            notifications.success('Rol eliminado correctamente');
            return true;
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                return false;
            }
            //console.error("Error al eliminar el rol:", error);
            notifications.error(
                error instanceof Error ? `Error al eliminar el rol: ${error.message}` : 'Error al eliminar el rol: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchRoles();
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return { roles, loading, createRole, refetch, updateRole, deleteRole };
}