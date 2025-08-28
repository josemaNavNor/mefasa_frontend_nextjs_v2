import { useState, useEffect } from "react"
import Swal from 'sweetalert2'


export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/users");
            const data = await response.json();
            setUsers(data.flat());
            //console.log(data);
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createUser(user: { name: string, last_name: string, email: string, password: string, role_id: string }) {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            const data = await response.json();
            //console.log(data);
            setUsers((prevUsers) => [...prevUsers, data]);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el usuario',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el usuario:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, createUser };
}
