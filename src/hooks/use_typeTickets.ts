import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function useType() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchTicketsType() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/types");
            const data = await response.json();
            setTypes(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener los tipos de ticket:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createTicketType(type: { type_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/types", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(type),
            });
            const data = await response.json();
            //console.log(data);
            setTypes((prevTypes) => [...prevTypes, data]);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Tipo de ticket creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el tipo de ticket',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el tipo de ticket:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTicketsType();
    }, []);

    return { types, loading, createTicketType };
}
