// Eventos específicos por página para evitar refrescos globales

// Eventos de tickets
export const TICKET_EVENTS = {
  UPDATED: 'ticket:updated',
  CREATED: 'ticket:created',
  DELETED: 'ticket:deleted',
  REFRESH_TICKETS_PAGE: 'ticket:refresh-page'
} as const;

// Eventos de filtros
export const FILTER_EVENTS = {
  UPDATED: 'filter:updated',
  CREATED: 'filter:created',
  DELETED: 'filter:deleted',
  CRITERIA_ADDED: 'filter:criteria-added',
  REFRESH_FILTERS_PAGE: 'filter:refresh-page'
} as const;

// Eventos de roles
export const ROLE_EVENTS = {
  UPDATED: 'role:updated',
  CREATED: 'role:created',
  DELETED: 'role:deleted',
  CLOSE_FORM: 'role:close-form'
} as const;

// Eventos de plantas (floors)
export const FLOOR_EVENTS = {
  UPDATED: 'floor:updated',
  CREATED: 'floor:created',
  DELETED: 'floor:deleted',
  CLOSE_FORM: 'floor:close-form'
} as const;

// Eventos de tipos de tickets
export const TYPE_EVENTS = {
  UPDATED: 'type:updated',
  CREATED: 'type:created',
  DELETED: 'type:deleted',
  CLOSE_FORM: 'type:close-form'
} as const;

// Eventos de usuarios
export const USER_EVENTS = {
  UPDATED: 'user:updated',
  CREATED: 'user:created',
  DELETED: 'user:deleted',
  REFRESH_USERS_PAGE: 'user:refresh-page',
  CLOSE_FORM: 'user:close-form'
} as const;

// Eventos globales (mantener para compatibilidad)
export const GLOBAL_EVENTS = {
  DATA_CHANGED: 'data-changed',
  TICKETS_UPDATED: 'tickets-updated',
  ROLES_UPDATED: 'roles-updated'
} as const;