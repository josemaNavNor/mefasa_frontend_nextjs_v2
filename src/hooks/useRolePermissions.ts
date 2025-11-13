'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/httpClient';

interface Permission {
  id: number;
  name: string;
  action?: string;
  displayName?: string;
}

interface Role {
  id: number;
  role_name: string;
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

  // Obtener todos los roles con sus permisos
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/permissions/roles');
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
      const data = await api.get('/permissions/grouped');
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
      const data = await api.get(`/permissions/roles/${roleId}`);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  // Sincronizar permisos de un rol
  const syncRolePermissions = async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    try {
      setLoading(true);
      await api.post(`/permissions/roles/${roleId}/sync-permissions`, { permissionIds });

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