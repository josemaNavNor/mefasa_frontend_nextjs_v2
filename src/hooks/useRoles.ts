import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useRoles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token'); 
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    async function fetchRoles() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/roles", {
                headers: getAuthHeaders()
            });
            
            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                return;
            }
            
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error("Error al obtener los roles:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createRole(role: { rol_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/roles", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(role),
            });
            
            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                return;
            }
            
            const data = await response.json();
            
            if (response.ok) {
                // Actualizar el estado local
                setRoles((prevRoles) => [...prevRoles, data]);
                
                // Emitir eventos globales
                eventEmitter.emit('data-changed', 'roles');
                eventEmitter.emit('roles-updated');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Rol creado',    
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear rol',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el rol:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el rol',
            });
        } finally {
            setLoading(false);
        }
    }

    // Función para refrescar datos (útil para eventos externos)
    const refetch = () => {
        fetchRoles();
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return { roles, loading, createRole, refetch };
}