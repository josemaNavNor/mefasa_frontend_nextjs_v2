import { useState, useEffect } from 'react';
import { UserFavFilter, CreateUserFavFilterDto, Filter } from '@/types/filter';
import { useAuthContext } from '@/components/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useUserFavFilters = () => {
  const { user } = useAuthContext();
  const [userFavFilters, setUserFavFilters] = useState<UserFavFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
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
        throw new Error('Error al obtener los filtros favoritos');
      }

      const data = await response.json();
      // Filtrar solo los filtros del usuario actual
      const userFilters = data.filter((favFilter: UserFavFilter) => 
        favFilter.user_id === user.id
      );

      // Para cada filtro favorito, obtener los detalles completos con criterios
      const filtersWithCriteria = await Promise.all(
        userFilters.map(async (favFilter: UserFavFilter) => {
          if (favFilter.filter && favFilter.filter.id) {
            try {
              const filterResponse = await fetch(`${API_BASE_URL}/filters/${favFilter.filter.id}`, {
                headers: getAuthHeader(),
              });
              
              if (filterResponse.ok) {
                const filterDetails = await filterResponse.json();
                return {
                  ...favFilter,
                  filter: filterDetails
                };
              }
            } catch (error) {
              console.error(`Error al obtener detalles del filtro ${favFilter.filter.id}:`, error);
            }
          }
          return favFilter;
        })
      );

      setUserFavFilters(filtersWithCriteria);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

      const newFavFilter = await response.json();
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

  const toggleFavorite = async (filterId: number): Promise<boolean> => {
    if (isFilterFavorite(filterId)) {
      return await removeFromFavoritesByFilterId(filterId);
    } else {
      const result = await addToFavorites(filterId);
      return result !== null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserFavFilters();
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