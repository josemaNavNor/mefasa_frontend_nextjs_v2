"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useUsersMinimal } from '@/hooks/useUsersMinimal';
import { MinimalUser } from '@/hooks/useUsersMinimal';

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
        throw new Error('useUsersMinimalContext must be used within a UsersMinimalProvider');
    }
    return context;
}

