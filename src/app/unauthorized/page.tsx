"use client";
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Usuario: <span className="font-medium">{user.name}</span><br />
              Rol: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full"
          >
            Ir a Inicio
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}