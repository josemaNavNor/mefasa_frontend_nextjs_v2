"use client";
import { useRoles } from "@/hooks/useRoles";

export default function RolesPage() {
  const { roles, loading } = useRoles();

  if (loading) return <p>Cargando roles...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Lista de Roles</h1>
      {roles && roles.length > 0 ? (
        <ul className="space-y-2">
          {roles.map((role) => (
            <li key={role.id} className="flex justify-between border p-2 rounded">
              <span>{role.role_name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay roles disponibles.</p>
      )}
    </div>
  );
}
