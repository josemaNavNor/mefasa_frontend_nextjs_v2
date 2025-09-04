import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function useAreas() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchAreas() {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/areas");
            const data = await response.json();
            setAreas(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener las areas:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createArea(area: { area_name: string,floor_id: number }) {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/areas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(area),
            });
            const data = await response.json();
            //console.log(data);
            setAreas((prevAreas) => [...prevAreas, data]);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Area creada',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear la area',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear la area:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAreas();
    }, []);

    return { areas, loading, createArea };
}
