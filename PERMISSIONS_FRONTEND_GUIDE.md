# Gestión de Permisos - Frontend

Esta documentación explica cómo utilizar el sistema de gestión de permisos desde el frontend.

## Componentes Creados

### 1. Hook useRolePermissions

Ubicación: `src/hooks/useRolePermissions.ts`

Este hook personalizado maneja toda la lógica de estado y comunicación con la API para gestionar roles y permisos.

#### Funciones disponibles:

- `fetchRoles()`: Obtiene todos los roles con sus permisos
- `fetchGroupedPermissions()`: Obtiene permisos agrupados por módulo
- `fetchRoleWithPermissions(roleId)`: Obtiene un rol específico
- `syncRolePermissions(roleId, permissionIds)`: Actualiza los permisos de un rol
- `roleHasPermission(role, permissionId)`: Verifica si un rol tiene un permiso
- `getRolePermissionIds(role)`: Obtiene los IDs de permisos de un rol

#### Estados disponibles:

- `roles`: Array de roles con sus permisos
- `groupedPermissions`: Permisos agrupados por módulo
- `loading`: Estado de carga
- `error`: Mensajes de error

### 2. Componente RolePermissionsManager

Ubicación: `src/components/admin/RolePermissionsManager.tsx`

Interfaz completa para gestionar permisos de roles con las siguientes características:

#### Funcionalidades:

1. **Selección de Rol**: Dropdown con todos los roles disponibles
2. **Vista por Módulos**: Permisos organizados por categorías
3. **Selección Múltiple**: Checkboxes para permisos individuales y por módulo
4. **Estados Intermedios**: Checkboxes con estado indeterminado cuando un módulo tiene algunos permisos seleccionados
5. **Detección de Cambios**: Muestra botones de guardar/resetear solo cuando hay cambios
6. **Feedback Visual**: Badges con contadores, alertas y estados de carga

## Endpoints de API

### GET `/api/permissions/roles`
Obtiene todos los roles con sus permisos asignados.

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Administrador",
    "description": "Acceso completo a todas las funcionalidades",
    "guard_name": "web",
    "permissions": [
      {
        "id": 1,
        "name": "usuarios.ver",
        "action": "ver",
        "displayName": "Ver/Consultar"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET `/api/permissions/grouped`
Obtiene permisos agrupados por módulo con nombres legibles.

**Respuesta:**
```json
[
  {
    "module": "usuarios",
    "displayName": "Gestión de Usuarios",
    "permissions": [
      {
        "id": 1,
        "name": "usuarios.ver",
        "action": "ver",
        "displayName": "Ver/Consultar"
      },
      {
        "id": 2,
        "name": "usuarios.crear",
        "action": "crear",
        "displayName": "Crear"
      }
    ]
  }
]
```

### GET `/api/permissions/roles/:roleId`
Obtiene un rol específico con sus permisos.

### POST `/api/permissions/roles/:roleId/sync-permissions`
Actualiza los permisos de un rol.

**Body:**
```json
{
  "permissionIds": [1, 2, 3, 4]
}
```

## Uso en la Aplicación

### 1. Integrar en una página de administración

```tsx
// src/app/(dashboard)/admin/roles/page.tsx
import RolePermissionsManager from '@/components/admin/RolePermissionsManager';

export default function RolesPage() {
  return (
    <div className="container mx-auto py-8">
      <RolePermissionsManager />
    </div>
  );
}
```

### 2. Agregar protección de ruta

```tsx
// Proteger la página con permisos
import { RequirePermission } from '@/components/auth/ProtectedRoute';

export default function RolesPage() {
  return (
    <RequirePermission permission="roles.editar">
      <RolePermissionsManager />
    </RequirePermission>
  );
}
```

### 3. Uso del hook en otros componentes

```tsx
import { useRolePermissions } from '@/hooks/useRolePermissions';

function MyComponent() {
  const { roles, syncRolePermissions, loading } = useRolePermissions();
  
  const handleQuickAssign = async (roleId: number, permissions: number[]) => {
    const success = await syncRolePermissions(roleId, permissions);
    if (success) {
      console.log('Permisos actualizados');
    }
  };

  return (
    <div>
      {roles.map(role => (
        <div key={role.id}>
          <h3>{role.name}</h3>
          <p>{role.permissions.length} permisos asignados</p>
        </div>
      ))}
    </div>
  );
}
```

## Personalización

### Modificar nombres de módulos

En `useRolePermissions.ts`, los nombres de módulos se mapean en la función `getModuleDisplayName()`:

```typescript
const moduleNames = {
  'usuarios': 'Gestión de Usuarios',
  'tickets': 'Sistema de Tickets',
  // Agregar más mapeos aquí
};
```

### Modificar nombres de acciones

Los nombres de acciones se mapean en `getPermissionDisplayName()`:

```typescript
const actionNames = {
  'ver': 'Ver/Consultar',
  'crear': 'Crear',
  // Agregar más mapeos aquí
};
```

### Estilos personalizados

El componente usa clases de Tailwind CSS y componentes de shadcn/ui. Para personalizar:

1. Modifica las clases CSS en `RolePermissionsManager.tsx`
2. Ajusta los componentes de UI según tu design system
3. Cambia los iconos importados de `lucide-react`

## Consideraciones de Rendimiento

1. **Lazy Loading**: El hook carga datos solo cuando se monta el componente
2. **Debouncing**: Considera agregar debounce para las búsquedas si agregas un filtro
3. **Optimistic Updates**: Los cambios se reflejan inmediatamente en la UI
4. **Error Handling**: Gestión completa de errores con mensajes específicos

## Próximas Mejoras

- [ ] Búsqueda y filtrado de permisos
- [ ] Historial de cambios en permisos
- [ ] Exportación/importación de configuraciones de roles
- [ ] Vista de comparación entre roles
- [ ] Notificaciones toast en lugar de alerts
- [ ] Paginación para roles con muchos permisos