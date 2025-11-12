// Librería para manejar autenticación de Microsoft via backend
import { api } from '@/lib/httpClient';

export class MicrosoftAuth {
  private static instance: MicrosoftAuth;

  constructor() {
    // this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  static getInstance(): MicrosoftAuth {
    if (!MicrosoftAuth.instance) {
      MicrosoftAuth.instance = new MicrosoftAuth();
    }
    return MicrosoftAuth.instance;
  }

  /**
   * Inicia el flujo de autenticacion con Microsoft
   * Redirige al usuario a Microsoft para autenticarse
   */
  async loginWithMicrosoft(): Promise<void> {
    try {
      // Obtener URL de autorizacion del backend
      const data = await api.get('/auth/microsoft/login');
      
      // Redirigir al usuario a Microsoft
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No se recibio URL de autorizacion');
      }
    } catch (error) {
      console.error('Error en login con Microsoft:', error);
      throw error;
    }
  }

  /**
   * Intercambia el codigo de autorizacion por un token
   * Se llama despues de que Microsoft redirija de vuelta
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<any> {
    try {
      const userData = await api.post('/auth/microsoft/callback', { code, state });
      
      // Guardar datos del usuario en localStorage
      if (userData.user && userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }

      return userData;
    } catch (error) {
      console.error('Error al intercambiar codigo:', error);
      throw error;
    }
  }

  /**
   * Verifica si hay un codigo en la URL (despues de la redireccion de Microsoft)
   */
  handleCallbackUrl(): { code: string | null; state: string | null; error: string | null } {
    if (typeof window === 'undefined') {
      return { code: null, state: null, error: null };
    }

    const urlParams = new URLSearchParams(window.location.search);
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error'),
    };
  }

  /**
   * Limpia los parametros de la URL después del callback
   */
  cleanUrl(): void {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      url.searchParams.delete('error');
      window.history.replaceState({}, document.title, url.toString());
    }
  }
}

export const microsoftAuth = MicrosoftAuth.getInstance();