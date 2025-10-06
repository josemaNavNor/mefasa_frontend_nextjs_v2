import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useFloors() {
    const [floors, setFloors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    async function fetchFloors() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/floors", {
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
                setFloors(data);
            } else if (data && Array.isArray(data.floors)) {
                setFloors(data.floors);
            } else {
                console.error('Unexpected data structure:', data);
                setFloors([]);
            }
        } catch (error) {
            console.error("Error al obtener las plantas:", error);
            setFloors([]);
        } finally {
            setLoading(false);
        }
    }

    async function createFloor(floor: { floor_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/floors", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(floor),
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
            
            if (response.ok) {
                setFloors((prevFloors) => [...prevFloors, data]);
                
                eventEmitter.emit('data-changed', 'floors');
                eventEmitter.emit('floors-updated');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Planta creada',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear la planta',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear la planta:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear la planta',
            });
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchFloors();
    };

    useEffect(() => {
        fetchFloors();
    }, []);

    return { floors, loading, createFloor, refetch };
}