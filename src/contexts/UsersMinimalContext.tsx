"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useUsersMinimal, MinimalUser } from '@/hooks/useUsersMinimal';

interface UsersMinimalContextType {
    users: MinimalUser[];
    loading: boolean;
}

const UsersMinimalContext = createContext<UsersMinimalContextType | undefined>(undefined);

export function UsersMinimalProvider({ children }: { children: ReactNode }) {
    const { users, loading } = useUsersMinimal();
    
    return (
        <UsersMinimalContext.Provider value={{ users, loading }}>
            {children}
        </UsersMinimalContext.Provider>
    );
}

export function useUsersMinimalContext() {
    const context = useContext(UsersMinimalContext);
    if (context === undefined) {
        throw new Error('useUsersMinimalContext debe ser usado dentro de un UsersMinimalProvider');
    }
    return context;
}

