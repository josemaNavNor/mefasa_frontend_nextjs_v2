"use client";
import { ReactNode } from 'react';
import { useAuthContext } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string | string[]; // Roles permitidos para acceder a la ruta
  requireAuth?: boolean; // Si requiere autenticación (por defecto true)
  fallbackPath?: string; // Ruta a la que redirigir si no tiene permisos
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallbackPath = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Esperar a que cargue la información de auth

    // Si se requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Si se especificaron roles y el usuario no tiene los permisos necesarios
    if (allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
      router.push('/unauthorized'); // O cualquier página de acceso denegado
      return;
    }
  }, [isAuthenticated, hasRole, allowedRoles, requireAuth, loading, router, fallbackPath]);

  // Mostrar loading mientras carga la información de auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si requiere auth y no está autenticado, no mostrar nada (se redirigirá)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si se especificaron roles y no los tiene, no mostrar nada (se redirigirá)
  if (allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
};

// Componentes específicos para roles (como en tu ejemplo de Express)
export const AdminOnly = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles="Administrador">
    {children}
  </ProtectedRoute>
);

export const TechOnly = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles="Tecnico">
    {children}
  </ProtectedRoute>
);

export const AdminOrTech = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['Administrador', 'Tecnico']}>
    {children}
  </ProtectedRoute>
);

// Hook para usar en componentes que necesitan verificar roles
export const useRoleCheck = () => {
  const { isAdmin, isTech, isUserFinal, hasRole } = useAuthContext();
  
  return {
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
    // Funciones helper específicas
    canManageUsers: isAdmin,
    canViewAllTickets: isAdmin || isTech,
    canCreateTickets: isAdmin || isTech || isUserFinal,
  };
};