import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/users");
            const data = await response.json();
            setUsers(data.flat());
            // console.log('API:', data);
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
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
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            const data = await response.json();

            if (response.ok) {
                // actualizar estado local inmediatamente
                setUsers((prevUsers) => [...prevUsers, data]);
                
                // eventos globales
                eventEmitter.emit('data-changed', 'users');
                eventEmitter.emit('users-updated');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el usuario',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el usuario',
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
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            const data = await response.json();

            if (response.ok) {
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
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el usuario',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el usuario',
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