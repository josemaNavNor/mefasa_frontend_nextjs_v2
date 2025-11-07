"use client";
import { useAuthContext } from '@/components/auth-provider';
import { TicketsDashboard } from '@/components/dashboard/TicketsDashboard';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <TicketsDashboard />
      </div>
    </div>
  );
}