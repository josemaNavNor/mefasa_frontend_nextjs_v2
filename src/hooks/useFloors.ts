import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function useFloors() {
    const [floors, setFloors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchFloors() {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/floors");
            const data = await response.json();
            setFloors(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener las plantas:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createFloor(floor: { floor_name: string, description: string}) {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/floors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(floor),
            });
            const data = await response.json();
            //console.log(data);
            setFloors((prevFloors) => [...prevFloors, data]);

            if (response.ok) {
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
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFloors();
    }, []);

    return { floors, loading, createFloor };
}
