'use client';

import { useState } from 'react';
import { api } from '@/lib/httpClient';

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

      const data = await api.post(`/auth/2fa/generate/${userId}`, {});
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

      const data = await api.post(`/auth/2fa/enable/${userId}`, { token: verificationCode });
      
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

      await api.post(`/auth/2fa/disable/${userId}`, { token: verificationCode });

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