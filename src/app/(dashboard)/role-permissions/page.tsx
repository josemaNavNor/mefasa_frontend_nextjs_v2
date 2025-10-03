"use client";

import { RolePermissionsManager } from "@/components/role-permissions-manager";

export default function RolePermissionsPage() {
    return (
        <div className="w-full px-4 py-4">
            <div className="mb-6">
                <h1 className="text-4xl font-bold">Asignación de Permisos a Roles</h1>
                <p className="text-gray-600 mt-2">
                    Gestiona qué permisos tiene cada rol en el sistema
                </p>
            </div>
            
            <RolePermissionsManager />
        </div>
    );
}