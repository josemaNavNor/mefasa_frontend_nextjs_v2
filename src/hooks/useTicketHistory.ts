import { useState, useEffect } from "react";
import Notiflix from 'notiflix';
import { useEventListener } from "./useEventListener";
import { api } from "@/lib/httpClient";

export interface TicketHistoryItem {
    id: number;
    ticket_id: number;
    user_id: number;
    action_type: string;
    description: string;
    old_values?: any;
    new_values?: any;
    created_at: string;
    user?: {
        id: number;
        name: string;
        last_name: string;
        email: string;
    };
}

export function useTicketHistory(ticketId?: number) {
    const [history, setHistory] = useState<TicketHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        if (!ticketId) return; 
        setLoading(true);

        try {
            const response = await api.get(`/ticket-history/by-ticket/${ticketId}`);
            
            if (Array.isArray(response)) {
                setHistory(response);
            } else if (response && Array.isArray(response.history)) {
                setHistory(response.history);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                setHistory([response]);
            } else {
                console.error('Unexpected data structure:', response);
                setHistory([]);
            }
        } catch (error) {
            console.error("Error al obtener el historial:", error);
            setHistory([]);
            Notiflix.Notify.failure('Error al cargar el historial del ticket');
        } finally {
            setLoading(false);
        }
    };

    const createHistoryEntry = async (entry: {
        ticket_id: number;
        user_id?: number;
        action_type: string;
        description: string;
        old_values?: any;
        new_values?: any;
    }) => {
        try {
            // Validar campos requeridos
            if (!entry.ticket_id || !entry.action_type || !entry.description) {
                console.error('Faltan datos requeridos para la entrada de historial:', entry);
                throw new Error('Datos requeridos faltantes para la entrada de historial');
            }

            const response = await api.post('/ticket-history', entry);

            await fetchHistory();
            Notiflix.Notify.success('Entrada de historial creada correctamente');
            return response;
        } catch (error) {
            console.error('Error al crear la entrada de historial:', error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al crear la entrada de historial: ${error.message}` : 'Error al crear la entrada de historial'
            );
            throw error;
        }
    };

    useEffect(() => {
        if (ticketId) {
            fetchHistory();
        }
    }, [ticketId]);

    // Escuchar eventos de actualización del historial
    useEventListener('ticket-history-updated', (updatedTicketId: number) => {
        if (ticketId && updatedTicketId === ticketId) {
            console.log('Recargando historial para ticket:', ticketId);
            // Agregar un pequeño delay para que el backend procese el historial
            setTimeout(() => {
                fetchHistory();
            }, 500);
        }
    });

    return {
        history,
        loading,
        fetchHistory,
        createHistoryEntry,
    };
}