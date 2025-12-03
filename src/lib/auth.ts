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
    // Solo limpiar datos de usuario (los tokens están en cookies HTTP-only y se limpian desde el backend)
    localStorage.removeItem(AUTH_CONFIG.userKey);
    sessionStorage.removeItem(AUTH_CONFIG.userKey);
  }

  getToken(): string | null {
    // Los tokens están en cookies HTTP-only, no accesibles desde JavaScript
    // Este método se mantiene por compatibilidad pero siempre retornará null
    return null;
  }

  getRefreshToken(): string | null {
    // Los tokens están en cookies HTTP-only, no accesibles desde JavaScript
    // Este método se mantiene por compatibilidad pero siempre retornará null
    return null;
  }

  getUser(): unknown {
    const user = localStorage.getItem(AUTH_CONFIG.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    // Verificar si hay datos de usuario guardados
    // La autenticación real se valida en el servidor mediante cookies HTTP-only
    return !!this.getUser();
  }
}

export const authService = new AuthService();