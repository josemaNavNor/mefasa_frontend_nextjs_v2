"use client";
import { useState } from "react";
import { useRoles } from "@/hooks/useRoles";

export default function CreateRolePage() {
    const { createRole } = useRoles();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createRole({ rol_name: name, description });
        setName("");
        setDescription("");
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Crear Rol</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre del rol"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Descripcion"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                />
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
