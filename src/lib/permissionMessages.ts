/**
 * Utilidades para generar mensajes de error específicos basados en permisos
 */

// Mapeo de módulos a nombres legibles
const MODULE_NAMES: Record<string, string> = {
  'usuarios': 'usuario',
  'tickets': 'ticket',
  'tipos': 'tipo de ticket',
  'pisos': 'piso',
  'filtros': 'filtro',
  'roles': 'rol',
  'comentarios': 'comentario',
  'archivos': 'archivo',
  'historial': 'historial',
  'reportes': 'reporte',
  'configuracion': 'configuración',
  'notificaciones': 'notificación',
  'dashboard': 'dashboard',
  'estadisticas': 'estadística',
};

// Mapeo de acciones a verbos en infinitivo
const ACTION_VERBS: Record<string, string> = {
  'ver': 'Ver',
  'crear': 'Crear',
  'editar': 'Editar',
  'eliminar': 'Eliminar',
  'asignar': 'Asignar',
  'cerrar': 'Cerrar',
  'reabrir': 'Reabrir',
  'comentar': 'Comentar',
  'actualizar': 'Actualizar',
  'favoritos': 'Gestionar favoritos',
  'subir': 'Subir',
  'descargar': 'Descargar',
  'exportar': 'Exportar',
  'generar': 'Generar',
  'enviar': 'Enviar',
  'backup': 'Realizar backup',
  'avanzadas': 'Acceder a funciones avanzadas',
};

/**
 * Convierte un nombre de permiso (ej: "usuarios.crear") a un mensaje legible
 * @param permissionName Nombre del permiso en formato "module.action"
 * @returns Mensaje legible como "Crear usuario"
 */
export function getPermissionDisplayName(permissionName: string): string {
  const [module, action] = permissionName.split('.');
  
  if (!module || !action) {
    return permissionName;
  }

  const moduleName = MODULE_NAMES[module] || module;
  const actionVerb = ACTION_VERBS[action] || action.charAt(0).toUpperCase() + action.slice(1);

  return `${actionVerb} ${moduleName}`;
}

/**
 * Genera un mensaje de error específico para un permiso
 * @param permissionName Nombre del permiso en formato "module.action"
 * @returns Mensaje como "No tienes permiso para Crear usuario"
 */
export function getPermissionErrorMessage(permissionName: string): string {
  const displayName = getPermissionDisplayName(permissionName);
  return `No tienes permiso para ${displayName}`;
}

/**
 * Extrae nombres de permisos de un mensaje de error del backend
 * El backend puede enviar mensajes como:
 * - "Permisos insuficientes. Requiere todos: usuarios.crear, usuarios.editar"
 * - "Permisos insuficientes. Requiere cualquiera de: tickets.ver, tickets.editar"
 * - "No tienes permiso para usuarios.crear"
 * @param errorMessage Mensaje de error del backend
 * @returns Array de nombres de permisos encontrados
 */
export function extractPermissionNames(errorMessage: string): string[] {
  // Patrón más robusto que captura: module.action donde action puede tener múltiples palabras
  // Ejemplos: usuarios.crear, tickets.asignar, comentarios.actualizar
  const permissionPattern = /([a-záéíóúñ]+\.(?:[a-záéíóúñ]+|actualizar|favoritos|avanzadas))/gi;
  const matches = errorMessage.match(permissionPattern);
  
  if (!matches) {
    return [];
  }
  
  // Eliminar duplicados y normalizar
  return [...new Set(matches.map(m => m.toLowerCase()))];
}

/**
 * Genera un mensaje de error específico basado en el mensaje del backend
 * Si se encuentran permisos específicos, genera mensajes para cada uno
 * @param errorMessage Mensaje de error del backend
 * @returns Mensaje de error específico o genérico si no se pueden extraer permisos
 */
export function generateSpecificErrorMessage(errorMessage: string): string {
  const permissionNames = extractPermissionNames(errorMessage);
  
  if (permissionNames.length === 0) {
    // Si no se pueden extraer permisos, usar mensaje genérico
    return 'Acceso denegado. No tienes permisos para realizar esta acción.';
  }

  if (permissionNames.length === 1 && permissionNames[0]) {
    // Un solo permiso: mensaje específico
    return getPermissionErrorMessage(permissionNames[0]);
  }

  // Múltiples permisos: mensaje combinado
  const displayNames = permissionNames.map(getPermissionDisplayName);
  const lastAction = displayNames.pop();
  const actionsList = displayNames.join(', ') + (displayNames.length > 0 ? ' o ' : '') + lastAction;
  
  return `No tienes permiso para ${actionsList}`;
}

/**
 * Intenta inferir un mensaje de error específico basado en la ruta
 * @param pathname Ruta actual (ej: "/users/create", "/tickets/edit/123")
 * @returns Mensaje específico si se puede inferir, null si no
 */
export function getPermissionErrorMessageFromPath(pathname: string): string | null {
  // Mapeo de rutas comunes a permisos
  const pathToPermission: Record<string, string> = {
    // Usuarios
    '/users': 'usuarios.ver',
    '/users/create': 'usuarios.crear',
    '/users/new': 'usuarios.crear',
    '/users/edit': 'usuarios.editar',
    '/users/delete': 'usuarios.eliminar',
    // Tickets
    '/tickets': 'tickets.ver',
    '/tickets/create': 'tickets.crear',
    '/tickets/new': 'tickets.crear',
    '/tickets/edit': 'tickets.editar',
    '/tickets/delete': 'tickets.eliminar',
    '/tickets/assign': 'tickets.asignar',
    // Tipos
    '/types': 'tipos.ver',
    '/types/create': 'tipos.crear',
    '/types/edit': 'tipos.editar',
    '/types/delete': 'tipos.eliminar',
    // Pisos
    '/floors': 'pisos.ver',
    '/floors/create': 'pisos.crear',
    '/floors/edit': 'pisos.editar',
    '/floors/delete': 'pisos.eliminar',
    // Roles
    '/roles': 'roles.ver',
    '/roles/create': 'roles.crear',
    '/roles/edit': 'roles.editar',
    '/roles/delete': 'roles.eliminar',
    '/roles/assign': 'roles.asignar',
    // Filtros
    '/filters': 'filtros.ver',
    '/filters/create': 'filtros.crear',
    '/filters/edit': 'filtros.editar',
    '/filters/delete': 'filtros.eliminar',
    // Permisos
    '/permissions': 'roles.ver',
    // Comentarios
    '/comments': 'comentarios.ver',
    '/comments/create': 'comentarios.crear',
    '/comments/edit': 'comentarios.actualizar',
    '/comments/delete': 'comentarios.eliminar',
  };

  // Buscar coincidencia exacta
  if (pathToPermission[pathname]) {
    return getPermissionErrorMessage(pathToPermission[pathname]);
  }

  // Buscar coincidencia parcial (ej: "/users/edit/123" -> "/users/edit")
  for (const [path, permission] of Object.entries(pathToPermission)) {
    if (pathname.startsWith(path + '/') || pathname === path) {
      return getPermissionErrorMessage(permission);
    }
  }

  return null;
}

