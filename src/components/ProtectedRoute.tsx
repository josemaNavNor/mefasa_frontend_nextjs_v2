"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthContext } from "./auth-provider";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  readonly children: ReactNode;
  readonly allowedRoles?: UserRole | UserRole[]; // Roles permitted to access the route
  readonly requireAuth?: boolean; // If authentication is required (default true)
  readonly fallbackPath?: string; // Route to redirect to if no permissions
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallbackPath = ROUTES.LOGIN 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth info to load

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // If roles were specified and user doesn't have required permissions
    if (allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
      router.push(ROUTES.UNAUTHORIZED); 
      return;
    }
  }, [isAuthenticated, hasRole, allowedRoles, requireAuth, loading, router, fallbackPath]);

  // Show loading while auth info is being loaded
  if (loading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // If authentication is required and user is not authenticated, show nothing
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If roles were specified and user doesn't have them, show nothing 
  if (allowedRoles && isAuthenticated && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}

// Specific components for roles
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

// Hook to use in components that need to check roles
export function useRoleCheck() {
  const { isAdmin, isTech, isUserFinal, hasRole } = useAuthContext();
  
  return {
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
    // Specific helper functions
    canManageUsers: isAdmin,
    canViewAllTickets: isAdmin || isTech,
    canCreateTickets: isAdmin || isTech || isUserFinal,
  };
}