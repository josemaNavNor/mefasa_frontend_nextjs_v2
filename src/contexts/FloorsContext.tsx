"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useFloors } from '@/hooks/useFloors';
import type { Floor } from '@/types';

interface FloorsContextType {
    floors: Floor[];
    loading: boolean;
    createFloor: (floor: { floor_name: string, description: string }) => Promise<void>;
    updateFloor: (id: number, floor: { floor_name?: string, description?: string }) => Promise<any>;
    deleteFloor: (id: number) => Promise<boolean>;
    refetch: () => void;
}

const FloorsContext = createContext<FloorsContextType | undefined>(undefined);

export function FloorsProvider({ children }: { children: ReactNode }) {
    const { floors, loading, createFloor, updateFloor, deleteFloor, refetch } = useFloors();
    
    return (
        <FloorsContext.Provider value={{ floors, loading, createFloor, updateFloor, deleteFloor, refetch }}>
            {children}
        </FloorsContext.Provider>
    );
}

export function useFloorsContext() {
    const context = useContext(FloorsContext);
    if (context === undefined) {
        throw new Error('useFloorsContext must be used within a FloorsProvider');
    }
    return context;
}

