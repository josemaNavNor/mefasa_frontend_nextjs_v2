"use client";
import { useRoles } from "@/hooks/useRoles";
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function RolesPage() {
    const { roles, loading } = useRoles();

    if (loading) return <p>Cargando roles...</p>;

    return (
        <div className="w-full px-4 py-4">
            <DataTable columns={columns} data={roles} />
        </div>
    );
}
