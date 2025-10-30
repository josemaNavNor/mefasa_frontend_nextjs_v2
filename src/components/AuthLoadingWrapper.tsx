"use client";
import { useAuthContext } from './auth-provider';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";

interface AuthLoadingWrapperProps {
  children: ReactNode;
}

export const AuthLoadingWrapper = ({ children }: AuthLoadingWrapperProps) => {
  const { loading, user, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Si ya no está cargando y no hay usuario autenticado, redirigir al login
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando...</h2>
            <p className="text-gray-500">Verificando información de autenticación</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Si no hay usuario después de cargar, mostrar loading mientras redirige
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirigiendo...</h2>
            <p className="text-gray-500">Redirigiendo al inicio de sesión</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return <>{children}</>;
};
