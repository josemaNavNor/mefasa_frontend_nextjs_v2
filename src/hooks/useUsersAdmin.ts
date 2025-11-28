import { useState, useEffect } from "react"
import { notifications } from '@/lib/notifications';
import { eventEmitter } from './useEventListener';
import { api } from '@/lib/httpClient';
import { USER_EVENTS } from '@/lib/events';

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await api.get('/users');
            
            if (Array.isArray(response)) {
                setUsers(response);
            } else if (response && Array.isArray(response.users)) {
                setUsers(response.users);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                setUsers([response]);
            } else {
                console.error('Unexpected data structure:', response);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            notifications.error('Error al cargar usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    async function createUser(user: { 
        name: string, 
        last_name: string, 
        email: string, 
        password: string, 
        phone_number?: string, 
        role_id: number, 
        is_email_verified: boolean, 
        email_verification_token: string, 
        two_factor_enable: boolean, 
        two_factor_secret: string 
    }) {
        setLoading(true);
        try {
            const response = await api.post('/users', user);
            setUsers((prevUsers) => [...prevUsers, response]);
            eventEmitter.emit(USER_EVENTS.CREATED);
            eventEmitter.emit(USER_EVENTS.REFRESH_USERS_PAGE);
            notifications.success(`Usuario ${user.name} ${user.last_name} creado correctamente`);
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                throw error; // Re-lanzar para que el componente pueda manejarlo si es necesario
            }
            notifications.error(
                error instanceof Error ? `Error al crear el usuario: ${error.message}` : 'Error al crear el usuario: Error desconocido'
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateUser(id: number, user: { 
        name?: string, 
        last_name?: string,
        email?: string, 
        password?: string, 
        phone_number?: string,
        role_id?: number,
        is_email_verified?: boolean,
        email_verification_token?: string,
        two_factor_enable?: boolean,
        two_factor_secret?: string
    }) {
        setLoading(true);
        try {
            const response = await api.patch(`/users/${id}`, user);
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === id ? { ...u, ...response } : u))
            );
            eventEmitter.emit(USER_EVENTS.UPDATED);
            eventEmitter.emit(USER_EVENTS.REFRESH_USERS_PAGE);
            notifications.success(`Usuario ${user.name ?? ''} ${user.last_name ?? ''} actualizado correctamente`);
            return response;
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                throw error; // Re-lanzar para que el componente pueda manejarlo si es necesario
            }
            //console.error("Error al actualizar el usuario:", error);
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el usuario: Error desconocido';
            notifications.error(errorMessage);
            throw error; // Re-throw para que el handler pueda manejarlo
        } finally {
            setLoading(false);
        }
    };

    async function deleteUser(id: number) {
        setLoading(true);
        try {
            await api.delete(`/users/${id}`);
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
            eventEmitter.emit(USER_EVENTS.DELETED);
            eventEmitter.emit(USER_EVENTS.REFRESH_USERS_PAGE);
            notifications.success('Usuario eliminado correctamente');
            return true;
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                return false;
            }
            //console.error("Error al eliminar el usuario:", error);
            notifications.error(
                error instanceof Error ? `Error al eliminar el usuario: ${error.message}` : 'Error al eliminar el usuario: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, createUser, refetch, updateUser, deleteUser };
}