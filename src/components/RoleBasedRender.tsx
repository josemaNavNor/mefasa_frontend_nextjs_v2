"use client";
import { ReactNode } from 'react';
import { useAuthContext } from './auth-provider';

interface RoleBasedRenderProps {
  allowedRoles: string | string[];
  children: ReactNode;
  fallback?: ReactNode; // Qué mostrar si no tiene el rol
}

// Componente para mostrar contenido basado en roles
export const RoleBasedRender = ({ allowedRoles, children, fallback = null }: RoleBasedRenderProps) => {
  const { hasRole, isAuthenticated } = useAuthContext();

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
  <RoleBasedRender allowedRoles="Administrador" fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ShowForTech = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedRender allowedRoles="Tecnico" fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ShowForAdminOrTech = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleBasedRender allowedRoles={['Administrador', 'Tecnico']} fallback={fallback}>
    {children}
  </RoleBasedRender>
);

// Hook para usar condicionalmente en JSX (similar a tu ejemplo de Express)
export const useConditionalRender = () => {
  const { user, isAdmin, isTech, isUserFinal, hasRole } = useAuthContext();

  return {
    // Información del usuario
    user,
    
    // Verificaciones de roles
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
    
    // Funciones helper para mostrar elementos específicos
    showForAdmin: (element: ReactNode) => isAdmin ? element : null,
    showForTech: (element: ReactNode) => isTech ? element : null,
    showForAdminOrTech: (element: ReactNode) => (isAdmin || isTech) ? element : null,
    showForRole: (role: string | string[], element: ReactNode) => hasRole(role) ? element : null,
    
    // Función para agregar elementos al menú dinámicamente (como en tu ejemplo)
    shouldShowMenuItem: (requiredRoles: string | string[]) => hasRole(requiredRoles),
  };
};