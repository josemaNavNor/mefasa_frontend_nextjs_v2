'use client';

import { useState } from 'react';
import RolePermissionsManager from '@/components/admin/RolePermissionsManager';
import PageAccessManager from '@/components/admin/PageAccessManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState<'permissions' | 'pages'>('permissions');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <div className="flex border-b">
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => setActiveTab('permissions')}
          >
            Permisos por Rol
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => setActiveTab('pages')}
          >
            Acceso a Páginas
          </Button>
        </div>
      </Card>

      {activeTab === 'permissions' && <RolePermissionsManager />}
      {activeTab === 'pages' && <PageAccessManager />}
    </div>
  );
}