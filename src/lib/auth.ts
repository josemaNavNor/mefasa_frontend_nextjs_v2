import { AUTH_CONFIG } from "./constants";
import { api } from '@/lib/httpClient';

interface LoginCredentials {
  email: string;
  password: string;
  token?: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

class AuthService {
  // Ya no necesitamos baseUrl porque httpClient lo maneja
  // private readonly baseUrl = `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}`;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login-2fa', credentials);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error de conexión");
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);
    sessionStorage.removeItem(AUTH_CONFIG.tokenKey);
    sessionStorage.removeItem(AUTH_CONFIG.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  getUser(): unknown {
    const user = localStorage.getItem(AUTH_CONFIG.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();