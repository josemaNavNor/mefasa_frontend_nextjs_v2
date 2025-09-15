import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function usePermissions() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchPermissions() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/permissions");
            const data = await response.json();
            setPermissions(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener los permisos:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createPermission(permission: { perm_name: string, module: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/permissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(permission),
            });
            const data = await response.json();
            //console.log(data);
            setPermissions((prevPermissions) => [...prevPermissions, data]);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Permiso creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear permiso',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el permiso:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPermissions();
    }, []);

    return { permissions, loading, createPermission };
}
