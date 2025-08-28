"use client";
import { useUsers } from "@/hooks/useUsersAdmin";

export default function UsersPage() {
    const { users, loading } = useUsers();

    if (loading) return <p>Cargando usuarios...</p>;

    return (
        <div className="max-w-lg mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
            {users && users.length > 0 ? (
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.id} className="flex justify-between border p-2 rounded">
                            <span>{user.name}</span>
                            <span>{user.last_name}</span>
                            <span>{user.role.rol_name}</span>
                            <span>{user.email}</span>
                            <span></span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay usuarios disponibles.</p>
            )}
        </div>
    );
}
