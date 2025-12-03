"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

/**
 * Hook personalizado para gestionar la autenticación del usuario
 * Proporciona funciones para login, logout y verificación de roles
 * @returns Objeto con estado de autenticación y funciones relacionadas
 */
export function useAuth(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  /**
   * Limpia el estado de autenticación
   * Nota: Los tokens están en cookies HTTP-only y se limpian desde el backend en logout
   */
  const clearAuthState = useCallback(() => {
    // Solo limpiar datos de usuario (no tokens, están en cookies HTTP-only)
    localStorage.removeItem(AUTH_CONFIG.userKey);
    sessionStorage.removeItem(AUTH_CONFIG.userKey);
    
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  }, []);

  /**
   * Establece el usuario autenticado
   * Nota: Los tokens están en cookies HTTP-only configuradas por el backend
   * @param user - Datos del usuario autenticado
   */
  const setAuthenticatedUser = useCallback((user: AuthUser) => {
    // Solo guardar datos de usuario (no tokens, están en cookies HTTP-only)
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
        // Solo leer datos de usuario (los tokens están en cookies HTTP-only)
        const userData = localStorage.getItem(AUTH_CONFIG.userKey);

        if (userData) {
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

  /**
   * Inicia sesin con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param token - Token OTP opcional para autenticación de dos factores
   * @returns Promise que se resuelve con el resultado del login
   */
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
        // Si usuario diferente, limpiar estado anterior
        if (currentUserId && currentUserId !== response.user.id) {
          clearAuthState();
          // Retraso para limpiar
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Convert string role to UserRole type
        const user: AuthUser = {
          ...response.user,
          role: response.user.role as UserRole,
        };

        // Set new user (los tokens están en cookies HTTP-only configuradas por el backend)
        setAuthenticatedUser(user);
        
        // Guardar recomendaciones en localStorage si existen
        if (response.recommendations) {
          localStorage.setItem('auth_recommendations', JSON.stringify(response.recommendations));
        }
        
        notifications.success(`¡Bienvenido, ${user.name}!`, {size: "small"});
        
        // Si hay recomendación de configurar 2FA, redirigir a página de callback para mostrar prompt
        if (response.recommendations?.setup2FA) {
          // Guardar datos necesarios para mostrar el prompt (sin tokens, están en cookies)
          const callbackUrl = `${ROUTES.LOGIN}/callback?user=${encodeURIComponent(JSON.stringify(user))}&recommendations=${encodeURIComponent(JSON.stringify(response.recommendations))}`;
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh();
          }, 300);
        } else {
          // Navigate to dashboard si no hay recomendaciones
          setTimeout(() => {
            router.push(ROUTES.HOME);
            router.refresh();
          }, 300);
        }

        return { success: true };
      } else {
        const errorMessage = "Credenciales inválidas. Por favor, inténtalo de nuevo.";
        notifications.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Error de conexión. Por favor, inténtalo de nuevo.";
      
      if (error instanceof Error) {
        const customError = error as any;
        
        // Si es un error de autenticación (401), mostrar mensaje específico
        if (customError.status === 401 || customError.type === 'AUTHENTICATION_ERROR') {
          errorMessage = error.message || "Credenciales incorrectas. Por favor, verifica tu email y contraseña.";
        }
        // Si es un error de autorización (403), mostrar mensaje específico
        else if (customError.status === 403 || customError.type === 'AUTHORIZATION_ERROR') {
          errorMessage = error.message || "Acceso denegado. No tienes permisos para acceder.";
        }
        // Para otros errores HTTP específicos del servidor
        else if (customError.status >= 400 && customError.status < 500) {
          errorMessage = error.message || "Error en la solicitud. Por favor, verifica los datos ingresados.";
        }
        // Para errores del servidor (500+)
        else if (customError.status >= 500) {
          errorMessage = "Error del servidor. Por favor, inténtalo más tarde.";
        }
        // Si no hay status pero hay mensaje del error, usarlo
        else if (error.message && !error.message.includes('fetch')) {
          errorMessage = error.message;
        }
      }
      
      notifications.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [state.user?.id, clearAuthState, setAuthenticatedUser, router]);

  /**
   * Cierra la sesión del usuario y limpia todos los datos de autenticación
   */
  const logout = useCallback(async () => {
    try {
      // El backend leerá el refresh_token de las cookies HTTP-only automáticamente
      await api.post('/auth/logout', {}).catch(() => {
        // Ignorar errores del logout en el backend
      });
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

  /**
   * Verifica si el usuario actual tiene uno de los roles especificados
   * @param roles - Rol o array de roles a verificar
   * @returns true si el usuario tiene alguno de los roles especificados
   */
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    
    if (typeof roles === "string") {
      return state.user.role === roles;
    }
    
    return roles.includes(state.user.role);
  }, [state.user]);

  // Derived state for role checks - memorizado para evitar recálculos innecesarios
  const isAdmin = useMemo(() => state.user?.role === USER_ROLES.ADMIN, [state.user?.role]);
  const isTech = useMemo(() => state.user?.role === USER_ROLES.TECH, [state.user?.role]);
  const isUserFinal = useMemo(() => state.user?.role === USER_ROLES.USER, [state.user?.role]);

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