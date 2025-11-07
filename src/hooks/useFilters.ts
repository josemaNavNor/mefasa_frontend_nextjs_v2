import { useState, useEffect } from 'react';
import { Filter, CreateFilterDto, UpdateFilterDto } from '@/types/filter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const useFilters = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado en localStorage');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/filters`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Se recibio:', text.substring(0, 200));
        throw new Error('El servidor no devolvió JSON válido. Posible error de autenticación o configuración.');
      }

      const data = await response.json();
      setFilters(data);
    } catch (err) {
      console.error('Error fetching filters:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createFilter = async (filterData: CreateFilterDto): Promise<Filter | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/filters`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(filterData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const newFilter = await response.json();
      setFilters(prev => [...prev, newFilter]);
      return newFilter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear el filtro';
      setError(errorMessage);
      console.error('Error creating filter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = async (id: number, filterData: UpdateFilterDto): Promise<Filter | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/filters/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(filterData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el filtro');
      }

      const updatedFilter = await response.json();
      setFilters(prev => prev.map(filter => 
        filter.id === id ? updatedFilter : filter
      ));
      return updatedFilter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteFilter = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/filters/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el filtro');
      }

      setFilters(prev => prev.filter(filter => filter.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFilterById = async (id: number): Promise<Filter | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/filters/${id}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el filtro');
      }

      const filter = await response.json();
      return filter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async (filterId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/filter/${filterId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Error al aplicar el filtro');
      }

      const tickets = await response.json();
      return tickets;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  return {
    filters,
    loading,
    error,
    fetchFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    getFilterById,
    applyFilter,
  };
};