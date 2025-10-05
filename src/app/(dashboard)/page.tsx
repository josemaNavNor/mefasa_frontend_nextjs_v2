"use client";
import { useAuthContext } from '@/components/auth-provider';
import { ShowForAdmin, ShowForTech, ShowForAdminOrTech } from '@/components/RoleBasedRender';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Ticket, Settings, Building2 } from 'lucide-react';

export default function DashboardHome() {
  const { user, isAdmin, isTech, isUserFinal } = useAuthContext();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, <span className="font-semibold">{user?.name}</span> - {user?.role}
        </p>
      </div>

      {/* Contenido específico para Administradores */}
      <ShowForAdmin>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Panel de Administración</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gestión de Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Administrar usuarios del sistema</CardDescription>
                <Button className="mt-2 w-full" size="sm" asChild>
                  <a href="/users">Gestionar</a>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles y Permisos</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Configurar roles y permisos</CardDescription>
                <Button className="mt-2 w-full" size="sm" asChild>
                  <a href="/roles">Configurar</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ShowForAdmin>

      {/* Contenido para Administradores y Técnicos */}
      <ShowForAdminOrTech>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Panel {isTech ? 'de Técnico' : 'Administrativo'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Ver y gestionar tickets</CardDescription>
                <Button className="mt-2 w-full" size="sm" asChild>
                  <a href="/tickets">Ver Tickets</a>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plantas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gestionar plantas del edificio</CardDescription>
                <Button className="mt-2 w-full" size="sm" asChild>
                  <a href="/floors">Ver Plantas</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ShowForAdminOrTech>

      {/* Contenido para todos los usuarios */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Acciones Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Mis Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Ver mis tickets {isUserFinal ? 'reportados' : 'asignados'}</CardDescription>
              <Button className="mt-2 w-full" size="sm" asChild>
                <a href="/tickets">Ver Mis Tickets</a>
              </Button>
            </CardContent>
          </Card>
          
          {/* Solo usuarios finales pueden crear tickets nuevos */}
          {isUserFinal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Crear Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Reportar un nuevo problema</CardDescription>
                <Button className="mt-2 w-full" size="sm" asChild>
                  <a href="/tickets/create">Crear Ticket</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Información del usuario */}
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