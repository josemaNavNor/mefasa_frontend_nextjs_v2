"use client";
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const { user, isAdmin, isTech, isUserFinal, loading } = useAuthContext();
  const [, forceUpdate] = useState({});

  // Escuchar cambios en el usuario para forzar re-render
  useEffect(() => {
    const handleUserChange = () => {
      //console.log('Dashboard: Usuario cambió, forzando re-render');
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

  // Si no hay usuario después de cargar, mostrar mensaje
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">No se pudo cargar la información del usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, <span className="font-semibold">{user?.name}</span> - {user?.role}
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información de la Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Usuario:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {user?.role}</p>
          <p><strong>Permisos:</strong></p>
          <ul className="ml-4 list-disc space-y-1">
            {isAdmin && <li>Gestión completa del sistema</li>}
            {isTech && <li>Gestión de tickets y plantas</li>}
            {isUserFinal && <li>Creación y seguimiento de tickets</li>}
            <li>Ver tickets propios</li>
            <li>Acceso al dashboard</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}