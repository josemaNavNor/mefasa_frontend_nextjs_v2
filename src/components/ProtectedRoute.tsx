"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthContext } from "./auth-provider";
import { usePageAccess } from "@/hooks/usePageAccess";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  readonly children: ReactNode;
  readonly allowedRoles?: UserRole | UserRole[]; // Roles permitidos (legacy, usar checkPageAccess para validación dinámica)
  readonly requireAuth?: boolean; // Si se requiere autenticación (por defecto true)
  readonly fallbackPath?: string; // Ruta a la que redirigir si no tiene permisos
  readonly checkPageAccess?: boolean; // Si se debe verificar acceso dinámico desde la BD (por defecto true)
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallbackPath = ROUTES.LOGIN,
  checkPageAccess = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, loading: authLoading } = useAuthContext();
  const { hasAccess, loading: pageAccessLoading } = usePageAccess();
  const router = useRouter();
  const pathname = usePathname();

  const loading = authLoading || (checkPageAccess && pageAccessLoading);

  useEffect(() => {
    if (loading) return; // Esperar a que se cargue la información de autenticación

    // Si se requiere autenticación y el usuario no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Validación dinámica de acceso a página (prioritaria)
    if (checkPageAccess && isAuthenticated && hasAccess === false) {
      router.push(ROUTES.UNAUTHORIZED);
      return;
    }

    // Validación por roles (legacy, solo si no se usa validación dinámica)
    if (!checkPageAccess && allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
      router.push(ROUTES.UNAUTHORIZED); 
      return;
    }
  }, [isAuthenticated, hasRole, allowedRoles, requireAuth, loading, router, fallbackPath, checkPageAccess, hasAccess]);

  // Mostrar carga mientras se carga la información de autenticación
  if (loading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Si se requiere autenticación y el usuario no está autenticado, no mostrar nada
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Validación dinámica de acceso a página
  if (checkPageAccess && isAuthenticated && hasAccess === false) {
    return null;
  }

  // Validación por roles (legacy)
  if (!checkPageAccess && allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}

// Componentes específicos para roles
export function AdminOnly({ children }: { readonly children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={USER_ROLES.ADMIN}>
      {children}
    </ProtectedRoute>
  );
}

export function TechOnly({ children }: { readonly children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={USER_ROLES.TECH}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOrTech({ children }: { readonly children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TECH]}>
      {children}
    </ProtectedRoute>
  );
}

// Hook para usar en componentes que necesitan verificar roles
export function useRoleCheck() {
  const { isAdmin, isTech, isUserFinal, hasRole } = useAuthContext();
  
  return {
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
    // Funciones auxiliares específicas
    canManageUsers: isAdmin,
    canViewAllTickets: isAdmin || isTech,
    canCreateTickets: isAdmin || isTech || isUserFinal,
  };
}