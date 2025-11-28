import { AUTH_CONFIG } from "./constants";
import { api } from '@/lib/httpClient';

interface LoginCredentials {
  email: string;
  password: string;
  token?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  recommendations?: {
    setup2FA: boolean;
    message: string | null;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login-2fa', credentials);
      return response;
    } catch (error) {
      // Preservar el error original para que useAuth pueda manejarlo apropiadamente
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(AUTH_CONFIG.userKey);
    sessionStorage.removeItem(AUTH_CONFIG.tokenKey);
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem(AUTH_CONFIG.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
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