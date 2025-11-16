"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { authService } from "@/lib/auth";
import { api } from "@/lib/httpClient";
import { notifications } from "@/lib/notifications";
import { AUTH_CONFIG, USER_ROLES, ROUTES } from "@/lib/constants";
import type { 
  AuthUser, 
  AuthState, 
  AuthContextValue, 
  UserRole,
  LoginCredentials 
} from "@/types";

export function useAuth(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Clear authentication state
  const clearAuthState = useCallback(() => {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(AUTH_CONFIG.userKey);
    sessionStorage.removeItem(AUTH_CONFIG.tokenKey);
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem(AUTH_CONFIG.userKey);
    
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  }, []);

  // Set authenticated user
  const setAuthenticatedUser = useCallback((user: AuthUser, token: string, refreshToken: string) => {
    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    
    setState({
      user,
      loading: false,
      isAuthenticated: true,
    });
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
        const userData = localStorage.getItem(AUTH_CONFIG.userKey);

        if (token && userData) {
          const user = JSON.parse(userData) as AuthUser;
          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        clearAuthState();
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [clearAuthState]);

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    token?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUserId = state.user?.id;
      
      const response = await authService.login({ 
        email, 
        password, 
        ...(token && { token }) 
      });

      if (response) {
        // If different user, clear previous state
        if (currentUserId && currentUserId !== response.user.id) {
          clearAuthState();
          // Delay for cleanup
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Convert string role to UserRole type
        const user: AuthUser = {
          ...response.user,
          role: response.user.role as UserRole,
        };

        // Set new user
        setAuthenticatedUser(user, response.access_token, response.refresh_token);
        
        notifications.success(`¡Bienvenido de nuevo, ${user.name}!`);
        
        // Navigate to dashboard
        setTimeout(() => {
          router.push(ROUTES.HOME);
          router.refresh();
        }, 300);

        return { success: true };
      } else {
        const errorMessage = "Credenciales inválidas. Por favor, inténtalo de nuevo.";
        notifications.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = "Error de conexión. Por favor, inténtalo de nuevo.";
      notifications.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [state.user?.id, clearAuthState, setAuthenticatedUser, router]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Intentar revocar el refresh token en el backend
        await api.post('/auth/logout', { refresh_token: refreshToken }).catch(() => {
          // Ignorar errores del logout en el backend
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      authService.logout();
      clearAuthState();
      
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 100);
    }
  }, [clearAuthState, router]);

  // Role checking helper
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    
    if (typeof roles === "string") {
      return state.user.role === roles;
    }
    
    return roles.includes(state.user.role);
  }, [state.user]);

  // Derived state for role checks
  const isAdmin = state.user?.role === USER_ROLES.ADMIN;
  const isTech = state.user?.role === USER_ROLES.TECH;
  const isUserFinal = state.user?.role === USER_ROLES.USER;

  return {
    // State
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    
    // Actions
    login,
    logout,
    
    // Role helpers
    hasRole,
    isAdmin,
    isTech,
    isUserFinal,
  };
}