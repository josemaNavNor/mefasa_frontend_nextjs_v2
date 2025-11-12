import { useState, useEffect } from 'react';
import { Filter, CreateFilterDto, UpdateFilterDto } from '@/types/filter';
import { api } from '@/lib/httpClient';
import { FILTER_EVENTS } from '@/lib/events';
import { eventEmitter } from './useEventListener';

export const useFilters = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/filters');
      
      // Verificar que data sea un array
      if (Array.isArray(data)) {
        setFilters(data);
      } else {
        console.error('Expected array but received:', typeof data, data);
        setFilters([]);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setFilters([]);
    } finally {
      setLoading(false);
    }
  };

  const createFilter = async (filterData: CreateFilterDto): Promise<Filter | null> => {
    setLoading(true);
    setError(null);
    try {
      const newFilter = await api.post('/filters', filterData);
      setFilters(prev => [...prev, newFilter]);
      // Emitir eventos específicos para la página de filtros
      eventEmitter.emit(FILTER_EVENTS.CREATED, newFilter);
      eventEmitter.emit(FILTER_EVENTS.REFRESH_FILTERS_PAGE);
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
      const updatedFilter = await api.patch(`/filters/${id}`, filterData);
      setFilters(prev => prev.map(filter => 
        filter.id === id ? updatedFilter : filter
      ));
      // Emitir eventos específicos para la página de filtros
      eventEmitter.emit(FILTER_EVENTS.UPDATED, { id, data: updatedFilter });
      eventEmitter.emit(FILTER_EVENTS.REFRESH_FILTERS_PAGE);
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
      await api.delete(`/filters/${id}`);
      setFilters(prev => prev.filter(filter => filter.id !== id));
      // Emitir eventos específicos para la página de filtros
      eventEmitter.emit(FILTER_EVENTS.DELETED, { id });
      eventEmitter.emit(FILTER_EVENTS.REFRESH_FILTERS_PAGE);
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
      const filter = await api.get(`/filters/${id}`);
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
      const tickets = await api.get(`/tickets/filter/${filterId}`);
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