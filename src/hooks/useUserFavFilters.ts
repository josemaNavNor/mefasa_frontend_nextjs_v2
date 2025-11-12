import { useState, useEffect } from 'react';
import { UserFavFilter, CreateUserFavFilterDto, Filter } from '@/types/filter';
import { useAuthContext } from '@/components/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const useUserFavFilters = () => {
  const { user } = useAuthContext();
  const [userFavFilters, setUserFavFilters] = useState<UserFavFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchUserFavFilters = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user-fav-filters`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('El servidor no devolvió JSON válido. Posible error de autenticación o configuración.');
      }

      const rawData = await response.json();
      console.log('Raw user fav filters data:', rawData);
      
      // Manejar la estructura estándar de respuesta {success, data, ...}
      let data = rawData;
      if (rawData && typeof rawData === 'object' && 'success' in rawData && 'data' in rawData) {
        data = rawData.data;
      }
      
      // Verificar que data sea un array antes de usar filter
      if (!Array.isArray(data)) {
        console.error('Expected array but received:', typeof data, data);
        setUserFavFilters([]);
        return;
      }
      
      // Filtrar solo los filtros del usuario actual
      const userFilters = data.filter((favFilter: UserFavFilter) => 
        favFilter.user_id === user.id
      );

      console.log('User filters after filtering:', userFilters);
      setUserFavFilters(userFilters);
    } catch (err) {
      console.error('Error in fetchUserFavFilters:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setUserFavFilters([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (filterId: number): Promise<UserFavFilter | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);
    try {
      const favFilterData: CreateUserFavFilterDto = {
        user_id: user.id,
        filter_id: filterId,
      };

      const response = await fetch(`${API_BASE_URL}/user-fav-filters`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(favFilterData),
      });

      if (!response.ok) {
        throw new Error('Error al agregar a favoritos');
      }

      const rawData = await response.json();
      
      // Manejar la estructura estándar de respuesta
      let newFavFilter = rawData;
      if (rawData && typeof rawData === 'object' && 'success' in rawData && 'data' in rawData) {
        newFavFilter = rawData.data;
      }
      
      setUserFavFilters(prev => [...prev, newFavFilter]);
      return newFavFilter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (favFilterId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user-fav-filters/${favFilterId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar de favoritos');
      }

      setUserFavFilters(prev => prev.filter(favFilter => favFilter.id !== favFilterId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavoritesByFilterId = async (filterId: number): Promise<boolean> => {
    const favFilter = userFavFilters.find(fav => fav.filter_id === filterId);
    if (!favFilter) return false;
    
    return await removeFromFavorites(favFilter.id);
  };

  const isFilterFavorite = (filterId: number): boolean => {
    return userFavFilters.some(favFilter => favFilter.filter_id === filterId);
  };

  const getFavoriteFilters = (): Filter[] => {
    return userFavFilters
      .map(favFilter => favFilter.filter)
      .filter((filter): filter is Filter => filter !== undefined);
  };

  // Ahora toggleFavorite devuelve la acción realizada para evitar confusiones
  // al mostrar mensajes en la UI (puede ser 'added', 'removed' o null en caso de error)
  const toggleFavorite = async (filterId: number): Promise<'added' | 'removed' | null> => {
    // Re-evaluar el estado actual con la información local
    if (isFilterFavorite(filterId)) {
      const removed = await removeFromFavoritesByFilterId(filterId);
      return removed ? 'removed' : null;
    } else {
      const result = await addToFavorites(filterId);
      return result ? 'added' : null;
    }
  };

  useEffect(() => {
    // Cada vez que cambie el usuario, recargar los favoritos desde el servidor
    if (user) {
      console.log('Cargando filtros favoritos del usuario');
      fetchUserFavFilters();
    } else {
      // usuario desconectado -> limpiar estado
      setUserFavFilters([]);
    }
  }, [user]);

  return {
    userFavFilters,
    loading,
    error,
    fetchUserFavFilters,
    addToFavorites,
    removeFromFavorites,
    removeFromFavoritesByFilterId,
    isFilterFavorite,
    getFavoriteFilters,
    toggleFavorite,
  };
};