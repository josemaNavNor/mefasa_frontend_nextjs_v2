'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/httpClient';
import { useAuthContext } from '@/components/auth-provider';

export interface Page {
  id: number;
  path: string;
  title: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  roles?: Array<{
    id: number;
    role_name: string;
  }>;
}

export interface MenuItem {
  title: string;
  url: string;
  icon: string;
  roles: string[];
}

export const usePages = () => {
  const { user } = useAuthContext();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las páginas
  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/pages?active=true');
      setPages(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener páginas accesibles para el usuario actual
  const fetchUserPages = useCallback(async () => {
    if (!user?.role_id) {
      setPages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/pages/by-role/${user.role_id}`);
      setPages(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching user pages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role_id]);

  // Convertir páginas a formato de menú
  const getMenuItems = useCallback((): MenuItem[] => {
    if (!pages || pages.length === 0) return [];

    // Mapeo de nombres de iconos a componentes (se manejará en el componente)
    const iconMap: Record<string, string> = {
      'Home': 'Home',
      'Ticket': 'Ticket',
      'Filter': 'Filter',
      'User2': 'User2',
      'Notebook': 'Notebook',
      'Footprints': 'Footprints',
      'Building2': 'Building2',
    };

    return pages
      .filter(page => page.is_active)
      .sort((a, b) => a.order - b.order)
      .map(page => ({
        title: page.title,
        url: page.path,
        icon: page.icon || 'Home',
        roles: page.roles?.map(r => r.role_name) || [],
      }));
  }, [pages]);

  // Cargar páginas al montar el componente
  useEffect(() => {
    if (user?.role_id) {
      fetchUserPages();
    } else {
      fetchPages();
    }
  }, [user?.role_id, fetchUserPages, fetchPages]);

  return {
    pages,
    menuItems: getMenuItems(),
    loading,
    error,
    fetchPages,
    fetchUserPages,
    refetch: user?.role_id ? fetchUserPages : fetchPages,
  };
};

