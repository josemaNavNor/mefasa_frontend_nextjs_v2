"use client";
import { ReactNode, useEffect, useState } from 'react';

import { useAuthContext } from './auth-provider';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';

interface RoleBasedRenderProps {
  allowedRoles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode; // Qué mostrar si no tiene el rol
}

// Componente para mostrar contenido basado en roles
export const RoleBasedRender = ({ allowedRoles, children, fallback = null }: RoleBasedRenderProps) => {
  const { hasRole, isAuthenticated, loading } = useAuthContext();
  const [, forceUpdate] = useState({});

  // Escuchar cambios en el usuario para forzar re-render
  useEffect(() => {
    const handleUserChange = () => {
      forceUpdate({});
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  // Si está cargando, no mostrar nada hasta que termine de cargar
  if (loading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Componentes específicos para roles
export const ShowForAdmin = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedRender allowedRoles={USER_ROLES.ADMIN} fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ShowForTech = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedRender allowedRoles={USER_ROLES.TECH} fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ShowForAdminOrTech = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedRender allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TECH]} fallback={fallback}>
    {children}
  </RoleBasedRender>
);

// Hook para usar condicionalmente en JSX (similar a tu ejemplo de Express)
export const useConditionalRender = () => {
  const { user, isAdmin, isTech, isUserFinal, hasRole, loading } = useAuthContext();

  return {
    // Información del usuario
    user,
    
    // Verificaciones de roles
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
    
    // Estado de carga
    loading,
    
    // Funciones helper para mostrar elementos específicos
    showForAdmin: (element: ReactNode) => (loading ? null : (isAdmin ? element : null)),
    showForTech: (element: ReactNode) => (loading ? null : (isTech ? element : null)),
    showForAdminOrTech: (element: ReactNode) => (loading ? null : ((isAdmin || isTech) ? element : null)),
    showForRole: (role: UserRole | UserRole[], element: ReactNode) => (loading ? null : (hasRole(role) ? element : null)),
    
    // Función para agregar elementos al menú dinámicamente (como en tu ejemplo)
    shouldShowMenuItem: (requiredRoles: UserRole | UserRole[]) => hasRole(requiredRoles),
  };
};