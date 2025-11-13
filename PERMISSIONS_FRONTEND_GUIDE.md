# Gestión de Permisos - Frontend

## 📁 Archivos Creados

### 1. Hook Principal
`src/hooks/useRolePermissions.ts` - Maneja toda la lógica de estado y API

### 2. Componente Principal  
`src/components/admin/RolePermissionsManager.tsx` - Interfaz completa para gestión de permisos

### 3. Página de Ejemplo
`src/app/(dashboard)/admin/roles/page.tsx` - Ejemplo de uso del componente

## 🚀 Cómo Usar

### 1. Acceso Directo
Navega a `/admin/roles` para usar la interfaz completa

### 2. Integrar en tu Layout
```tsx
import RolePermissionsManager from '@/components/admin/RolePermissionsManager';

export default function AdminPage() {
  return <RolePermissionsManager />;
}
```

### 3. Usar el Hook en otros Componentes
```tsx
import { useRolePermissions } from '@/hooks/useRolePermissions';

function MyComponent() {
  const { roles, syncRolePermissions, loading } = useRolePermissions();
  
  // Tu lógica aquí
}
```

## ⚙️ Funcionalidades

### ✅ Selección de Rol
- Dropdown con todos los roles disponibles
- Vista previa de información del rol seleccionado
- Contador de permisos actuales

### ✅ Gestión de Permisos
- **Por Módulo**: Checkbox maestro para seleccionar todos los permisos de un módulo
- **Individual**: Checkbox por cada permiso específico
- **Estados Visuales**:
  - ✅ Completamente seleccionado (verde)
  - ➖ Parcialmente seleccionado (amarillo con ícono minus)
  - ❌ No seleccionado (gris)

### ✅ Experiencia de Usuario
- **Detección de Cambios**: Botones aparecen solo cuando hay modificaciones
- **Resetear**: Volver al estado original
- **Guardar**: Aplicar cambios con confirmación
- **Loading States**: Spinners durante operaciones
- **Manejo de Errores**: Alertas descriptivas

### ✅ Organización Visual
- Permisos agrupados por módulos (Usuarios, Tickets, Reportes, etc.)
- Nombres legibles en español
- Contadores `X/Y permisos` por módulo
- Grid responsivo para permisos individuales

## 🔧 Configuración de API

El hook está configurado para usar las siguientes rutas:

- `GET /api/permissions/roles` - Obtener todos los roles
- `GET /api/permissions/grouped` - Obtener permisos agrupados
- `POST /api/permissions/roles/:id/sync-permissions` - Actualizar permisos

### Headers de Autenticación
Busca automáticamente el token en:
- `localStorage.getItem('token')`
- `sessionStorage.getItem('token')`

## 🎨 Personalización

### Cambiar Nombres de Módulos
En el backend, modifica `getModuleDisplayName()` en `PermissionsService`

### Estilos
El componente usa Tailwind CSS y shadcn/ui. Modifica las clases según tu design system.

### Iconos
Usa lucide-react. Puedes cambiar los iconos importando otros:
```tsx
import { Save, RotateCcw, Minus, CheckCircle } from 'lucide-react';
```

## 📱 Responsive
- **Mobile**: 1 columna
- **Tablet**: 2 columnas  
- **Desktop**: 3 columnas

## ❗ Requisitos
- React 18+
- Next.js 13+ (app router)
- Tailwind CSS
- shadcn/ui components:
  - Card, Button, Checkbox, Select, Badge, Separator, Alert
- lucide-react icons

¡Todo listo para usar! 🎉