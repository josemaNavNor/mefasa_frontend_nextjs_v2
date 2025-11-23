"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useTickets } from '@/hooks/useTickets';
import type { Ticket, CreateTicketDto, UpdateTicketDto } from '@/types';

interface TicketsContextType {
    tickets: Ticket[];
    loading: boolean;
    isPolling: boolean;
    createTicket: (ticket: CreateTicketDto) => Promise<void>;
    updateTicket: (id: string, ticket: UpdateTicketDto) => Promise<Ticket | null>;
    deleteTicket: (id: string | number) => Promise<boolean>;
    refetch: () => void;
    exportToExcel: (ticketsToExport?: Ticket[]) => void;
    markTicketAsViewed: (id: string) => Promise<boolean>;
    fetchTicketById: (id: string) => Promise<Ticket | null>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
    const {
        tickets,
        loading,
        isPolling,
        createTicket,
        updateTicket,
        deleteTicket,
        refetch,
        exportToExcel,
        markTicketAsViewed,
        fetchTicketById
    } = useTickets();
    
    return (
        <TicketsContext.Provider value={{
            tickets,
            loading,
            isPolling,
            createTicket,
            updateTicket,
            deleteTicket,
            refetch,
            exportToExcel,
            markTicketAsViewed,
            fetchTicketById
        }}>
            {children}
        </TicketsContext.Provider>
    );
}

export function useTicketsContext() {
    const context = useContext(TicketsContext);
    if (context === undefined) {
        throw new Error('useTicketsContext must be used within a TicketsProvider');
    }
    return context;
}

