"use client";
import { useAuthContext } from './auth-provider';
import { ReactNode } from 'react';

interface AuthLoadingWrapperProps {
  children: ReactNode;
}

export const AuthLoadingWrapper = ({ children }: AuthLoadingWrapperProps) => {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando...</h2>
          <p className="text-gray-500">Verificando información de autenticación</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};