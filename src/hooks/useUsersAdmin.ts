import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'
import { api } from '@/lib/httpClient'

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {
        setLoading(true);
        try {
            const data = await api.get('/users');
            //console.log('API Response:', data);
            //console.log('Is Array:', Array.isArray(data));
            //console.log('Data type:', typeof data);
            
            // Verificar si data es un array, si no, usar data directamente
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data && Array.isArray(data.users)) {
                // Si la respuesta tiene estructura { users: [...] }
                setUsers(data.users);
            } else if (data && typeof data === 'object') {
                // Si es un objeto, convertir a array con un elemento
                setUsers([data]);
            } else {
                console.error('Unexpected data structure:', data);
                setUsers([]);
            }
        } catch (error) {
            //console.error("Error al obtener los usuarios:", error);
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
            const data = await api.post('/users', user);
            
            // actualizar estado local inmediatamente
            setUsers((prevUsers) => [...prevUsers, data]);
            
            // eventos globales
            eventEmitter.emit('data-changed', 'users');
            eventEmitter.emit('users-updated');
            
            Swal.fire({
                icon: 'success',
                title: 'Usuario creado',
                text: 'Usuario creado exitosamente',
            });
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear el usuario',
                text: error instanceof Error ? error.message : 'Error desconocido',
            });
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
            const data = await api.patch(`/users/${id}`, user);
            
            // Actualizar estado local
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === id ? { ...u, ...data } : u))
            );

            // Eventos globales
            eventEmitter.emit('data-changed', 'users');
            eventEmitter.emit('users-updated');

            Swal.fire({
                icon: 'success',
                title: 'Usuario actualizado',
                text: 'Usuario actualizado exitosamente',
            });
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar el usuario',
                text: error instanceof Error ? error.message : 'Error desconocido',
            });
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, createUser, refetch, updateUser };
}