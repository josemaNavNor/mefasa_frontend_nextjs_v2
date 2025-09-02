import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function useRoles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchRoles() {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/roles");
            const data = await response.json();
            setRoles(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener los roles:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createRole(role: { rol_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(role),
            });
            const data = await response.json();
            //console.log(data);
            setRoles(data.flat());

            if (response.ok) {
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
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRoles();
    }, []);

    return { roles, loading, createRole };
}
