// Librería para manejar autenticación de Microsoft via backend
export class MicrosoftAuth {
  private static instance: MicrosoftAuth;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  static getInstance(): MicrosoftAuth {
    if (!MicrosoftAuth.instance) {
      MicrosoftAuth.instance = new MicrosoftAuth();
    }
    return MicrosoftAuth.instance;
  }

  /**
   * Inicia el flujo de autenticación con Microsoft
   * Redirige al usuario a Microsoft para autenticarse
   */
  async loginWithMicrosoft(): Promise<void> {
    try {
      // Paso 1: Obtener URL de autorización del backend
      const response = await fetch(`${this.baseUrl}/auth/microsoft/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener URL de autorización');
      }

      const data = await response.json();
      
      // Paso 2: Redirigir al usuario a Microsoft
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No se recibió URL de autorización');
      }
    } catch (error) {
      console.error('Error en login con Microsoft:', error);
      throw error;
    }
  }

  /**
   * Intercambia el código de autorización por un token
   * Se llama después de que Microsoft redirija de vuelta
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/microsoft/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        throw new Error('Error al intercambiar código por token');
      }

      const userData = await response.json();
      
      // Guardar datos del usuario en localStorage
      if (userData.user && userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }

      return userData;
    } catch (error) {
      console.error('Error al intercambiar código:', error);
      throw error;
    }
  }

  /**
   * Verifica si hay un código en la URL (después de la redirección de Microsoft)
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
   * Limpia los parámetros de la URL después del callback
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