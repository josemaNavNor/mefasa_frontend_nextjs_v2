import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useFloors() {
    const [floors, setFloors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchFloors() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/floors");
            const data = await response.json();
            setFloors(data.flat());
            //console.log('API:', data);
        } catch (error) {
            console.error("Error al obtener las plantas:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createFloor(floor: { floor_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/floors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(floor),
            });
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