class HttpClient {
  private baseUrl: string;

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

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Para el endpoint de login, no redirigir automáticamente
      const isLoginEndpoint = response.url.includes('/auth/login');
      
      if (!isLoginEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        window.location.href = '/login';
      }
      
      // Intentar obtener el mensaje específico del backend
      const error = await response.json().catch(() => ({ message: 'Credenciales incorrectas' }));
      const errorMessage = error.message || 'Credenciales incorrectas';
      
      const customError = new Error(errorMessage);
      (customError as any).status = 401;
      (customError as any).type = 'AUTHENTICATION_ERROR';
      throw customError;
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
      (customError as any).status = response.status;
      (customError as any).type = 'HTTP_ERROR';
      throw customError;
    }

    const jsonData = await response.json();
    
    // Si la respuesta tiene la estructura estándar del backend {success, data, ...}, devolver solo los datos
    if (jsonData && typeof jsonData === 'object' && 'success' in jsonData && 'data' in jsonData) {
      return jsonData.data;
    }
    
    // Si no, devolver la respuesta completa (compatibilidad con respuestas que no usan la estructura estándar)
    return jsonData;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
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