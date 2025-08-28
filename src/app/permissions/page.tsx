"use client";
import { usePermissions } from "@/hooks/usePermissions";

export default function RolesPage() {
  const { permissions, loading } = usePermissions();

  if (loading) return <p>Cargando permisos...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Lista de Permisos</h1>
      {permissions && permissions.length > 0 ? (
        <ul className="space-y-2">
          {permissions.map((permission) => (
            <li key={permission.id} className="flex justify-between border p-2 rounded">
              <span>{permission.perm_name}</span>
              <span>{permission.module}</span>
              <span>{permission.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay permisos disponibles.</p>
      )}
    </div>
  );
}
