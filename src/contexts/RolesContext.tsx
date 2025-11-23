"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useRoles } from '@/hooks/useRoles';

interface RolesContextType {
    roles: any[];
    loading: boolean;
    createRole: (role: { role_name: string, description: string }) => Promise<void>;
    updateRole: (id: number, role: { role_name?: string, description?: string }) => Promise<any>;
    deleteRole: (id: number) => Promise<boolean>;
    refetch: () => void;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export function RolesProvider({ children }: { children: ReactNode }) {
    const { roles, loading, createRole, updateRole, deleteRole, refetch } = useRoles();
    
    return (
        <RolesContext.Provider value={{
            roles,
            loading,
            createRole,
            updateRole,
            deleteRole,
            refetch
        }}>
            {children}
        </RolesContext.Provider>
    );
}

export function useRolesContext() {
    const context = useContext(RolesContext);
    if (context === undefined) {
        throw new Error('useRolesContext must be used within a RolesProvider');
    }
    return context;
}

