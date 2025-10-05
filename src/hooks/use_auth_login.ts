import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Notiflix from 'notiflix';


interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = authService.getToken();
    const userData = authService.getUser();

    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, token?: string) => {
    try {
      const response = await authService.login({ email, password, token });

      if (response) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        Notiflix.Notify.success(`¡Bienvenido de nuevo, ${response.user.name}!`);
        router.push('/');
      } else {
        Notiflix.Notify.failure('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      }
      return { success: true };
    } catch (error) {
      Notiflix.Notify.failure('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      return { success: false, error: 'Credenciales inválidas' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  // Funciones helper para verificar roles
  const isAdmin = user?.role === 'Administrador';
  const isTech = user?.role === 'Tecnico';
  const isUserFinal = user?.role === 'Usuario Final';

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    
    return roles.includes(user.role);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Nuevas funciones para manejo de roles
    isAdmin,
    isTech,
    isUserFinal,
    hasRole,
  };
}