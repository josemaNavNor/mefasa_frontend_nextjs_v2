/**
 * Servicio de logging configurable
 * Solo loguea en modo desarrollo para evitar logs innecesarios en producción
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log de depuración - solo en desarrollo
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  /**
   * Log de información - solo en desarrollo
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  /**
   * Log de advertencia - siempre visible
   */
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  
  /**
   * Log de error - siempre visible
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};


