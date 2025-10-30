'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Usuario autenticado, no hacer nada - mostrar el dashboard
        return;
      } else {
        // No hay usuario autenticado, redirigir al login
        router.replace('/login');
      }
    }
  }, [user, loading, isAuthenticated, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, mostrar loading mientras redirige
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario autenticado, redirigir al dashboard dentro del layout protegido
  // En lugar de mostrar contenido aquí, vamos a redirigir al grupo de rutas del dashboard
  router.replace('/dashboard');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg text-muted-foreground">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}