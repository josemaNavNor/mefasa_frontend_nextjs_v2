'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { api } from '@/lib/httpClient';

export const usePageAccess = () => {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthContext();
  const { roles, loading: rolesLoading } = useRolePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener el ID del rol basado en el nombre del rol del usuario
  const roleId = useMemo(() => {
    if (!user?.role || roles.length === 0) return null;
    const role = roles.find(r => r.role_name === user.role);
    return role?.id ?? null;
  }, [user?.role, roles]);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || rolesLoading || !user?.role || !roleId) {
        setLoading(true);
        setHasAccess(null);
        return;
      }

      try {
        setLoading(true);
        // Verificar acceso usando el endpoint del backend
        const access = await api.get(
          `/pages/check-access?roleId=${roleId}&path=${encodeURIComponent(pathname)}`
        );
        setHasAccess(access === true);
      } catch (error) {
        console.error('Error checking page access:', error);
        // En caso de error, por defecto denegar acceso
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [pathname, roleId, authLoading, rolesLoading, user?.role]);

  return {
    hasAccess,
    loading: loading || authLoading || rolesLoading,
    pathname,
  };
};

