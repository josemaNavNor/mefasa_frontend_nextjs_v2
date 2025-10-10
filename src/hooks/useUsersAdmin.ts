import { useState, useEffect } from "react"
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'
import { api } from '@/lib/httpClient'

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
            Notiflix.Notify.failure('Error al cargar usuarios');
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
            eventEmitter.emit('data-changed', 'users');
            eventEmitter.emit('users-updated');
            Notiflix.Notify.success('Usuario creado exitosamente');
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            Notiflix.Notify.failure(
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
            eventEmitter.emit('data-changed', 'users');
            eventEmitter.emit('users-updated');
            Notiflix.Notify.success('Usuario actualizado correctamente');
            return response;
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el usuario: Error desconocido';
            Notiflix.Notify.failure(errorMessage);
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
            eventEmitter.emit('data-changed', 'users');
            eventEmitter.emit('users-updated');
            Notiflix.Notify.success('Usuario eliminado correctamente');
            return true;
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            Notiflix.Notify.failure(
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