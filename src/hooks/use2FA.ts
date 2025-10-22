'use client';

import { useState } from 'react';

interface TwoFAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes?: string[];
}

interface Enable2FAResponse {
  message: string;
  backupCodes?: string[];
}

export function use2FA() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<TwoFAResponse | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  };

  const generate2FASecret = async (): Promise<TwoFAResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuario no encontrado');
      }

      const response = await fetch(`${baseUrl}/auth/2fa/generate/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error generando el código 2FA');
      }

      const data = await response.json();
      setQrCodeData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const enable2FA = async (verificationCode: string): Promise<Enable2FAResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuario no encontrado');
      }

      const response = await fetch(`${baseUrl}/auth/2fa/enable/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código de verificación inválido');
      }

      const data = await response.json();
      
      // Actualizar el estado del usuario en localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.twoFactorEnabled = true;
        localStorage.setItem('user', JSON.stringify(user));
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async (verificationCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Usuario no encontrado');
      }

      const response = await fetch(`${baseUrl}/auth/2fa/disable/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código de verificación inválido');
      }

      // Actualizar el estado del usuario en localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.twoFactorEnabled = false;
        localStorage.setItem('user', JSON.stringify(user));
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    qrCodeData,
    generate2FASecret,
    enable2FA,
    disable2FA,
    clearError,
  };
}