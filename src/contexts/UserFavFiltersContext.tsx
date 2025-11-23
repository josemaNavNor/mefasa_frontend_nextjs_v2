"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useUserFavFilters } from '@/hooks/useUserFavFilters';
import { UserFavFilter, Filter } from '@/types/filter';

interface UserFavFiltersContextType {
    userFavFilters: UserFavFilter[];
    loading: boolean;
    error: string | null;
    fetchUserFavFilters: () => Promise<void>;
    addToFavorites: (filterId: number) => Promise<UserFavFilter | null>;
    removeFromFavorites: (favFilterId: number) => Promise<boolean>;
    removeFromFavoritesByFilterId: (filterId: number) => Promise<boolean>;
    isFilterFavorite: (filterId: number) => boolean;
    getFavoriteFilters: () => Filter[];
    toggleFavorite: (filterId: number) => Promise<'added' | 'removed' | null>;
}

const UserFavFiltersContext = createContext<UserFavFiltersContextType | undefined>(undefined);

export function UserFavFiltersProvider({ children }: { children: ReactNode }) {
    const {
        userFavFilters,
        loading,
        error,
        fetchUserFavFilters,
        addToFavorites,
        removeFromFavorites,
        removeFromFavoritesByFilterId,
        isFilterFavorite,
        getFavoriteFilters,
        toggleFavorite
    } = useUserFavFilters();
    
    return (
        <UserFavFiltersContext.Provider value={{
            userFavFilters,
            loading,
            error,
            fetchUserFavFilters,
            addToFavorites,
            removeFromFavorites,
            removeFromFavoritesByFilterId,
            isFilterFavorite,
            getFavoriteFilters,
            toggleFavorite
        }}>
            {children}
        </UserFavFiltersContext.Provider>
    );
}

export function useUserFavFiltersContext() {
    const context = useContext(UserFavFiltersContext);
    if (context === undefined) {
        throw new Error('useUserFavFiltersContext must be used within a UserFavFiltersProvider');
    }
    return context;
}

