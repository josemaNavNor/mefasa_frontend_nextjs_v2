import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useType() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    async function fetchTicketsType() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/types", {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }
            
            const data = await response.json();
            
            // Manejo seguro de la respuesta
            if (Array.isArray(data)) {
                setTypes(data);
            } else if (data && Array.isArray(data.types)) {
                setTypes(data.types);
            } else {
                console.error('Unexpected data structure:', data);
                setTypes([]);
            }
        } catch (error) {
            console.error("Error al obtener los tipos de ticket:", error);
            setTypes([]);
        } finally {
            setLoading(false);
        }
    }

    async function createType(type: { type_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/types", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(type),
            });
            
            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                localStorage.removeItem('token');
                localStorage.removeUser('user');
                window.location.href = '/login';
                return;
            }
            
            const data = await response.json();
            
            if (response.ok) {
                setTypes((prevTypes) => [...prevTypes, data]);
                
                eventEmitter.emit('data-changed', 'types');
                eventEmitter.emit('types-updated');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Tipo creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el tipo',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el tipo:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el tipo',
            });
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchTicketsType();
    };

    useEffect(() => {
        fetchTicketsType();
    }, []);

    return { types, loading, createType, refetch };
}