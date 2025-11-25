class HttpClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('No hay token disponible');
    }

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
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.access_token;

      // Update stored token
      localStorage.setItem('token', newAccessToken);
      
      return newAccessToken;
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
      window.location.href = '/unauthorized';
      const customError = new Error('Acceso denegado');
      (customError as any).status = 403;
      (customError as any).type = 'AUTHORIZATION_ERROR';
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
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    return this.handleResponse(response);
  }

  private clearAuthAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    
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