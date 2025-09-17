import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useAreas() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchAreas() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/areas");
            const data = await response.json();
            setAreas(data.flat());
            //console.log('API:', data);
        } catch (error) {
            console.error("Error al obtener las areas:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createArea(area: { area_name: string, floor_id: number }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/areas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(area),
            });
            const data = await response.json();
            
            if (response.ok) {
                setAreas((prevAreas) => [...prevAreas, data]);
                
                eventEmitter.emit('data-changed', 'areas');
                eventEmitter.emit('areas-updated');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Area creada',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el area',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el area:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el area',
            });
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchAreas();
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    return { areas, loading, createArea, refetch };
}