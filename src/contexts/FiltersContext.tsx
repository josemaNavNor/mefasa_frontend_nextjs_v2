"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { Filter, CreateFilterDto, UpdateFilterDto } from '@/types/filter';

interface FiltersContextType {
    filters: Filter[];
    loading: boolean;
    error: string | null;
    fetchFilters: () => Promise<void>;
    createFilter: (filterData: CreateFilterDto) => Promise<Filter | null>;
    updateFilter: (id: number, filterData: UpdateFilterDto) => Promise<Filter | null>;
    deleteFilter: (id: number) => Promise<boolean>;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const { filters, loading, error, fetchFilters, createFilter, updateFilter, deleteFilter } = useFilters();
    
    return (
        <FiltersContext.Provider value={{
            filters,
            loading,
            error,
            fetchFilters,
            createFilter,
            updateFilter,
            deleteFilter
        }}>
            {children}
        </FiltersContext.Provider>
    );
}

export function useFiltersContext() {
    const context = useContext(FiltersContext);
    if (context === undefined) {
        throw new Error('useFiltersContext must be used within a FiltersProvider');
    }
    return context;
}

