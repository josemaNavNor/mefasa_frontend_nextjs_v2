"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthContext } from "./auth-provider";
import { usePageAccess } from "@/hooks/usePageAccess";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import { notifications } from "@/lib/notifications";
import { getPermissionErrorMessageFromPath } from "@/lib/permissionMessages";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  readonly children: ReactNode;
  readonly allowedRoles?: UserRole | UserRole[]; // Roles permitidos (legacy, usar checkPageAccess para validación dinámica)
  readonly requireAuth?: boolean; // Si se requiere autenticación (por defecto true)
  readonly fallbackPath?: string; // Ruta a la que redirigir si no tiene permisos
  readonly checkPageAccess?: boolean; // Si se debe verificar acceso dinámico desde la BD (por defecto true)
  readonly unauthorizedMessage?: string; // Mensaje personalizado cuando no hay acceso (opcional)
  readonly unauthorizedDuration?: number; // Duración del mensaje en ms (opcional, por defecto 5000)
  readonly unauthorizedPosition?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"; // Posición del mensaje (opcional)
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallbackPath = ROUTES.LOGIN,
  checkPageAccess = true,
  unauthorizedMessage = 'No tienes permisos para acceder a esta página.',
  unauthorizedDuration = 5000,
  unauthorizedPosition = 'top-right',
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, loading: authLoading } = useAuthContext();
  const { hasAccess, loading: pageAccessLoading } = usePageAccess();
  const router = useRouter();
  const pathname = usePathname();
  const hasShownUnauthorizedMessage = useRef(false);

  const loading = authLoading || (checkPageAccess && pageAccessLoading);

  useEffect(() => {
    if (loading) return; // Esperar a que se cargue la información de autenticación

    // Si se requiere autenticación y el usuario no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    //Validacion dinmica de acceso a pagina 
    if (checkPageAccess && isAuthenticated && hasAccess === false) {
      // Mostrar mensaje de error en lugar de redirigir
      if (!hasShownUnauthorizedMessage.current) {
        const message = unauthorizedMessage === 'No tienes permisos para acceder a esta página.' 
          ? (getPermissionErrorMessageFromPath(pathname) || unauthorizedMessage)
          : unauthorizedMessage;
        
        notifications.error(
          message,
          {
            duration: unauthorizedDuration,
            position: unauthorizedPosition,
          }
        );
        hasShownUnauthorizedMessage.current = true;
      }
      // No redirigir automáticamente - el usuario permanece en la página actual
      return;
    }

    // Validación por roles (legacy, solo si no se usa validación dinámica)
    if (!checkPageAccess && allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
      // Mostrar mensaje de error en lugar de redirigir
      if (!hasShownUnauthorizedMessage.current) {
        // Intentar generar mensaje específico basado en la ruta si no se proporcionó uno personalizado
        const message = unauthorizedMessage === 'No tienes permisos para acceder a esta página.' 
          ? (getPermissionErrorMessageFromPath(pathname) || unauthorizedMessage)
          : unauthorizedMessage;
        
        notifications.error(
          message,
          {
            duration: unauthorizedDuration,
            position: unauthorizedPosition,
          }
        );
        hasShownUnauthorizedMessage.current = true;
      }
      // No redirigir automáticamente - el usuario permanece en la página actual
      return;
    }

    // Resetear el flag si el usuario tiene acceso
    if (hasAccess === true || (allowedRoles && hasRole(allowedRoles))) {
      hasShownUnauthorizedMessage.current = false;
    }
  }, [isAuthenticated, hasRole, allowedRoles, requireAuth, loading, router, fallbackPath, checkPageAccess, hasAccess, unauthorizedMessage, unauthorizedDuration, unauthorizedPosition]);

  // Mostrar carga mientras se carga la información de autenticación
  if (loading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Si se requiere autenticación y el usuario no está autenticado, no mostrar nada
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Validación dinámica de acceso a página
  // El usuario permanece en la página pero no ve contenido (el mensaje ya se mostró)
  if (checkPageAccess && isAuthenticated && hasAccess === false) {
    return null;
  }

  // Validación por roles (legacy)
  // El usuario permanece en la página pero no ve contenido (el mensaje ya se mostró)
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