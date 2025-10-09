import { useState, useEffect } from "react"
import { api } from '@/lib/httpClient'
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'

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

    async function createRole(role: { rol_name: string, description: string }) {
        setLoading(true);
        try {
            const data = await api.post('/roles', role);
            setRoles((prevRoles) => [...prevRoles, data]);
            eventEmitter.emit('data-changed', 'roles');
            eventEmitter.emit('roles-updated');
            Notiflix.Notify.success('Rol creado exitosamente');
        } catch (error) {
            console.error("Error al crear el rol:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al crear el rol: ${error.message}` : 'Error al crear el rol: Error desconocido'
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateRole(id: number, role: { rol_name?: string, description?: string }) {
        setLoading(true);
        try {
            const response = await api.patch(`/roles/${id}`, role);
            setRoles((prevRoles) =>
                prevRoles.map((r) => (r.id === id ? { ...r, ...response } : r))
            );
            eventEmitter.emit('data-changed', 'roles');
            eventEmitter.emit('roles-updated');
            Notiflix.Notify.success('Rol actualizado correctamente');
            return response;
        } catch (error) {
            console.error("Error al actualizar el rol:", error);
            Notiflix.Notify.failure(
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
            eventEmitter.emit('data-changed', 'roles');
            eventEmitter.emit('roles-updated');
            Notiflix.Notify.success('Rol eliminado correctamente');
            return true;
        } catch (error) {
            console.error("Error al eliminar el rol:", error);
            Notiflix.Notify.failure(
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