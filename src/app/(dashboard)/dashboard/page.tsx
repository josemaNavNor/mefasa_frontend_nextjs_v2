"use client";
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const { user, loading } = useAuthContext();
  const [, forceUpdate] = useState({});

  // Escuchar cambios en el usuario para forzar re-render
  useEffect(() => {
    const handleUserChange = () => {
      forceUpdate({});
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  // Mostrar loading mientras se carga la información de autenticación
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido <span className="font-semibold">{user?.name}</span> - {user?.role}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Usuario:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Rol:</strong> {user?.role}</p>
          </CardContent>
        </Card>

        {/* Aquí puedes agregar más cards con estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Panel de estadísticas del sistema
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}