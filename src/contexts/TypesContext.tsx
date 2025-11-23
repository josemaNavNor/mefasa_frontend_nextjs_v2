"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useType } from '@/hooks/useTypeTickets';
import type { TicketType } from '@/types';

interface TypesContextType {
    types: TicketType[];
    loading: boolean;
    createTicketType: (type: { type_name: string, description: string }) => Promise<void>;
    updateTicketType: (id: number, type: { type_name?: string, description?: string }) => Promise<any>;
    deleteTicketType: (id: number) => Promise<boolean>;
    refetch: () => void;
}

const TypesContext = createContext<TypesContextType | undefined>(undefined);

export function TypesProvider({ children }: { children: ReactNode }) {
    const { types, loading, createTicketType, updateTicketType, deleteTicketType, refetch } = useType();
    
    return (
        <TypesContext.Provider value={{ types, loading, createTicketType, updateTicketType, deleteTicketType, refetch }}>
            {children}
        </TypesContext.Provider>
    );
}

export function useTypesContext() {
    const context = useContext(TypesContext);
    if (context === undefined) {
        throw new Error('useTypesContext must be used within a TypesProvider');
    }
    return context;
}

