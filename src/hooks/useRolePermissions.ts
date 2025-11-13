'use client';

import { useState, useEffect } from 'react';

interface Permission {
  id: number;
  name: string;
  action?: string;
  displayName?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  guard_name: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

interface GroupedPermissions {
  module: string;
  displayName: string;
  permissions: Permission[];
}

export const useRolePermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para obtener headers con autenticación
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper para manejar errores de respuesta
  const handleApiError = (response: Response, defaultMessage: string): never => {
    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción.');
    } else if (response.status === 404) {
      throw new Error('Recurso no encontrado.');
    } else if (response.status >= 500) {
      throw new Error('Error del servidor. Por favor intenta más tarde.');
    } else {
      throw new Error(defaultMessage);
    }
  };

  // Obtener todos los roles con sus permisos
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions/roles', {
        headers: getAuthHeaders()
      });
      if (!response.ok) handleApiError(response, 'Error al obtener roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener permisos agrupados por módulo
  const fetchGroupedPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions/grouped', {
        headers: getAuthHeaders()
      });
      if (!response.ok) handleApiError(response, 'Error al obtener permisos');
      const data = await response.json();
      setGroupedPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener un rol específico con sus permisos
  const fetchRoleWithPermissions = async (roleId: number): Promise<Role | null> => {
    try {
      const response = await fetch(`/api/permissions/roles/${roleId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) handleApiError(response, 'Error al obtener el rol');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  // Sincronizar permisos de un rol
  const syncRolePermissions = async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/permissions/roles/${roleId}/sync-permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissionIds }),
      });

      if (!response.ok) handleApiError(response, 'Error al actualizar permisos del rol');

      // Actualizar la lista de roles localmente
      await fetchRoles();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un rol tiene un permiso específico
  const roleHasPermission = (role: Role, permissionId: number): boolean => {
    return role.permissions.some(p => p.id === permissionId);
  };

  // Obtener todos los IDs de permisos de un rol
  const getRolePermissionIds = (role: Role): number[] => {
    return role.permissions.map(p => p.id);
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchRoles();
    fetchGroupedPermissions();
  }, []);

  return {
    roles,
    groupedPermissions,
    loading,
    error,
    fetchRoles,
    fetchGroupedPermissions,
    fetchRoleWithPermissions,
    syncRolePermissions,
    roleHasPermission,
    getRolePermissionIds,
    setError,
  };
};