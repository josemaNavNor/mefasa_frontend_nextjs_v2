'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { api } from '@/lib/httpClient';

export const usePageAccess = () => {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthContext();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || !user?.role_id) {
        setLoading(true);
        setHasAccess(null);
        return;
      }

      try {
        setLoading(true);
        // Verificar acceso usando el endpoint del backend
        const access = await api.get(
          `/pages/check-access?roleId=${user.role_id}&path=${encodeURIComponent(pathname)}`
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
  }, [pathname, user?.role_id, authLoading]);

  return {
    hasAccess,
    loading: loading || authLoading,
    pathname,
  };
};

