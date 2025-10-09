"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Notiflix from 'notiflix';
import { User, AuthState } from '@/types/use_auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });
  
  const router = useRouter();

  // Limpiar el estado de autenticación
  const clearAuthState = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    setState({
      user: null,
      loading: false,
      isAuthenticated: false
    });
  }, []);

  // Establecer usuario autenticado
  const setAuthenticatedUser = useCallback((user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setState({
      user,
      loading: false,
      isAuthenticated: true
    });
  }, []);

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          setState({
            user,
            loading: false,
            isAuthenticated: true
          });
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        clearAuthState();
      }
    };

    // Pequeño delay para asegurar que localStorage esté disponible
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [clearAuthState]);

  // Función de login
  const login = useCallback(async (email: string, password: string, token?: string) => {
    try {
      const currentUserId = state.user?.id;
      
      const response = await authService.login({ email, password, token });

      if (response) {
        // Si es un usuario diferente, limpiar estado anterior
        if (currentUserId && currentUserId !== response.user.id) {
          clearAuthState();
          // delay para limpieza
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Establecer nuevo usuario
        setAuthenticatedUser(response.user, response.access_token);
        
        Notiflix.Notify.success(`¡Bienvenido de nuevo, ${response.user.name}!`);
        
        // Navegar al dashboard
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 300);

        return { success: true };
      } else {
        Notiflix.Notify.failure('Credenciales inválidas. Por favor, inténtalo de nuevo.');
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      //console.error('Login error:', error);
      Notiflix.Notify.failure('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      return { success: false, error: 'Credenciales inválidas' };
    }
  }, [state.user?.id, clearAuthState, setAuthenticatedUser, router]);

  // Cerrar sesion
  const logout = useCallback(() => {
    authService.logout();
    clearAuthState();
    
    setTimeout(() => {
      router.push('/login');
    }, 100);
  }, [clearAuthState, router]);

  // helpers para verificar roles
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!state.user) return false;
    
    if (typeof roles === 'string') {
      return state.user.role === roles;
    }
    
    return roles.includes(state.user.role);
  }, [state.user]);

  return {
    // Estado
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    
    // Acciones
    login,
    logout,
    
    // Helpers de roles
    hasRole,
    isAdmin: state.user?.role === 'Administrador',
    isTech: state.user?.role === 'Tecnico',
    isUserFinal: state.user?.role === 'Usuario Final',
  };
}