import { notifications } from './notifications';
import { generateSpecificErrorMessage } from './permissionMessages';

class HttpClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  // Configuración de mensajes de error de autorización
  private readonly unauthorizedMessage = 'Acceso denegado. No tienes permisos para realizar esta acción.';
  private readonly unauthorizedDuration = 5000; // 5 segundos
  private readonly unauthorizedPosition: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" = 'top-right';

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    // Las cookies HTTP-only se envían automáticamente con las peticiones
    // No necesitamos leer el token manualmente
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    return headers;
  }

  private processQueue(error: any = null, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      // El refresh token está en las cookies HTTP-only
      // El backend lo leerá automáticamente de las cookies
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies
        body: JSON.stringify({}), // El backend leerá el refresh_token de las cookies
      });

      if (!response.ok) {
        return null;
      }

      // El nuevo access token se guarda automáticamente en una cookie HTTP-only por el backend
      // No necesitamos leerlo ni guardarlo manualmente
      await response.json();
      
      return 'refreshed'; // Indicador de que el token fue refrescado
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  private async handleResponse(response: Response, originalRequest?: { 
    endpoint: string; 
    method: string; 
    data?: any 
  }): Promise<any> {
    // Endpoints de autenticacion que NO deben intentar refrescar token
    const authEndpoints = [
      '/auth/login-2fa',
      '/auth/register',
      '/auth/refresh',
      '/auth/microsoft-login',
      '/auth/microsoft/callback',
    ];
    
    const isAuthEndpoint = originalRequest && authEndpoints.some(endpoint => 
      originalRequest.endpoint.includes(endpoint)
    );

    // Para endpoints de autenticacion con 401, manejar el error normalmente
    if (response.status === 401 && isAuthEndpoint) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      const errorMessage = error.message || `Error ${response.status}: ${response.statusText}`;
      
      const customError = new Error(errorMessage);
      (customError as any).status = response.status;
      (customError as any).type = 'AUTHENTICATION_ERROR';
      throw customError;
    }

    // Solo intentar refrescar token si NO es un endpoint de autenticacion
    if (response.status === 401 && originalRequest && !isAuthEndpoint) {
      // Token expirado, intentar refrescar
      if (this.isRefreshing) {
        // Esperar a que el token se refresque
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Reintentar la peticion original con el nuevo token
            return this.retryRequest(originalRequest);
          })
          .catch((err) => {
            throw err;
          });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          this.processQueue(null, newToken);
          // Reintentar la peticion original
          return this.retryRequest(originalRequest);
        } else {
          // Fallo al refrescar el token, cerrar sesion
          this.processQueue(new Error('Token de acceso expirado'), null);
          this.clearAuthAndRedirect();
          throw new Error('Token de acceso expirado');
        }
      } catch (error) {
        this.processQueue(error, null);
        this.clearAuthAndRedirect();
        throw new Error('Token de acceso expirado');
      } finally {
        this.isRefreshing = false;
      }
    }

    if (response.status === 401 && !originalRequest) {
      // No hay peticion original para reintentar, solo cerrar sesion
      this.clearAuthAndRedirect();
      throw new Error('Token expirado');
    }

    if (response.status === 403) {
      // Intentar extraer el mensaje de error del backend para generar mensaje específico
      let errorMessage = this.unauthorizedMessage;
      try {
        const errorData = await response.clone().json().catch(() => null);
        if (errorData?.message) {
          // Generar mensaje específico basado en el permiso requerido
          errorMessage = generateSpecificErrorMessage(errorData.message);
        }
      } catch (e) {
        // Si no se puede leer el mensaje, usar el mensaje por defecto
        console.warn('No se pudo extraer mensaje de error del backend:', e);
      }
      
      // Mostrar mensaje de error específico en lugar de redirigir
      notifications.error(
        errorMessage,
        {
          duration: this.unauthorizedDuration,
          position: this.unauthorizedPosition,
        }
      );
      
      const customError = new Error('Acceso denegado');
      (customError as any).status = 403;
      (customError as any).type = 'AUTHORIZATION_ERROR';
      (customError as any).originalMessage = errorMessage;
      throw customError;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      const errorMessage = error.message || `Error ${response.status}: ${response.statusText}`;
      
      const customError = new Error(errorMessage);
      console.error('HTTP Error:', errorMessage);
      (customError as any).status = response.status;
      (customError as any).type = 'HTTP_ERROR';
      throw customError;
    }

    const jsonData = await response.json();
    
    // Si la respuesta tiene la estructura estandar {success, data, ...}, devolver solo los datos
    if (jsonData && typeof jsonData === 'object' && 'success' in jsonData && 'data' in jsonData) {
      return jsonData.data;
    }
    
    // Si no, devolver la respuesta completa 
    return jsonData;
  }

  private async retryRequest(request: { endpoint: string; method: string; data?: any }) {
    const { endpoint, method, data } = request;

    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders(),
      credentials: 'include', // Importante: incluir cookies en todas las peticiones
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    return this.handleResponse(response);
  }

  private clearAuthAndRedirect() {
    // Limpiar solo datos de usuario (no tokens, están en cookies HTTP-only)
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // El backend limpiará las cookies en el logout
    // Redirigir al login
    window.location.href = '/login';
  }

  /**
   * Realiza una petición GET
   * @param endpoint - Ruta del endpoint a consultar
   * @returns Promise con los datos de la respuesta
   */
  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Incluir cookies (HTTP-only)
    });

    return this.handleResponse(response, { endpoint, method: 'GET' });
  }

  /**
   * Realiza una petición POST
   * @param endpoint - Ruta del endpoint
   * @param data - Datos a enviar en el cuerpo de la petición
   * @returns Promise con los datos de la respuesta
   */
  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Incluir cookies (HTTP-only)
      body: JSON.stringify(data),
    });

    return this.handleResponse(response, { endpoint, method: 'POST', data });
  }

  /**
   * Realiza una petición PUT
   * @param endpoint - Ruta del endpoint
   * @param data - Datos a enviar en el cuerpo de la petición
   * @returns Promise con los datos de la respuesta
   */
  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Incluir cookies (HTTP-only)
      body: JSON.stringify(data),
    });

    return this.handleResponse(response, { endpoint, method: 'PUT', data });
  }

  /**
   * Realiza una petición DELETE
   * @param endpoint - Ruta del endpoint
   * @returns Promise con los datos de la respuesta
   */
  async delete(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Incluir cookies (HTTP-only)
    });

    return this.handleResponse(response, { endpoint, method: 'DELETE' });
  }

  /**
   * Realiza una petición PATCH
   * @param endpoint - Ruta del endpoint
   * @param data - Datos a enviar en el cuerpo de la petición
   * @returns Promise con los datos de la respuesta
   */
  async patch(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Incluir cookies (HTTP-only)
      body: JSON.stringify(data),
    });

    return this.handleResponse(response, { endpoint, method: 'PATCH', data });
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

// Funciones helper para usar el cliente (similar a axios)
export const api = {
  get: (endpoint: string) => httpClient.get(endpoint),
  post: (endpoint: string, data: any) => httpClient.post(endpoint, data),
  put: (endpoint: string, data: any) => httpClient.put(endpoint, data),
  delete: (endpoint: string) => httpClient.delete(endpoint),
  patch: (endpoint: string, data: any) => httpClient.patch(endpoint, data),
};