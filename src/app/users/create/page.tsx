"use client";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsersAdmin";
import { useRoles } from "@/hooks/useRoles";


export default function CreateUserPage() {
    const { roles } = useRoles();
    const { createUser } = useUsers();
    const { users } = useUsers();
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createUser({ name, last_name: lastName, email, password, role_id: roleId });
        setName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRoleId("");
    };


    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Crear Usuario</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre del usuario"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Correo electronico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <label htmlFor="options" className="block mb-2 text-sm font-medium">
                    Selecciona un rol
                </label>
                <select
                    id="options"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="border rounded p-2 w-full"
                >
                    <option value="">-- Selecciona --</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.rol_name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-2 rounded"
                >
                    Guardar
                </button>
            </form>
        </div>
    );
}
