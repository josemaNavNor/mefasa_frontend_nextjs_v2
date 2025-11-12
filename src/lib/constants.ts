export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "HDM - Help Desk Mefasa",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Sistema de Help Desk para Mefasa",
  version: "1.0.0",
} as const;

export const API_CONFIG = {
  baseUrl: process.env.BACKEND_URL || "http://localhost:4000",
  version: "v1",
  timeout: 30000, // 30 seconds
} as const;

export const AUTH_CONFIG = {
  tokenKey: "token",
  userKey: "user",
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  UNAUTHORIZED: "/unauthorized",
  SETUP_2FA: "/setup-2fa",
} as const;

export const USER_ROLES = {
  ADMIN: "Administrador",
  TECH: "Tecnico", 
  USER: "Usuario Final",
} as const;

export const TICKET_STATUS = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
} as const;

export const TICKET_PRIORITY = {
  LOW: "Baja",
  MEDIUM: "Media", 
  HIGH: "Alta",
  URGENT: "Urgente",
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning", 
  INFO: "info",
} as const;