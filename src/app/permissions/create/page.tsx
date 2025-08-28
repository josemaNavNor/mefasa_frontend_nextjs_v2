"use client";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export default function CreatePermissionPage() {
    const { createPermission } = usePermissions();
    const [name, setName] = useState("");
    const [module, setModule] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPermission({ perm_name: name, module, description });
        setName("");
        setModule("");
        setDescription("");
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Crear Rol</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre del permiso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Nombre del modulo"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Descripción"
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
