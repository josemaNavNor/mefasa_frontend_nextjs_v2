import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEventListener } from "./useEventListener";

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

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    const fetchHistory = async () => {
        if (!ticketId) return;
        
        setLoading(true);
        try {
            const response = await fetch(
                `https://mefasa-backend-nestjs.onrender.com/api/v1/ticket-history/by-ticket/${ticketId}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(),
                }
            );

            if (response.status === 401) {
                toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                setHistory(data);
            } else {
                console.error('Unexpected data structure:', data);
                setHistory([]);
            }
        } catch (error) {
            console.error("Error al obtener el historial:", error);
            setHistory([]);
            toast.error('Error al cargar el historial del ticket');
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
            // Validate required fields
            if (!entry.ticket_id || !entry.action_type || !entry.description) {
                console.error('Missing required fields for history entry:', entry);
                throw new Error('Datos requeridos faltantes para la entrada de historial');
            }

            console.log('Creating history entry for ticket:', entry.ticket_id, 'action:', entry.action_type);
            
            const headers = getAuthHeaders();
            const requestBody = JSON.stringify(entry);
            
            const response = await fetch(
                'https://mefasa-backend-nestjs.onrender.com/api/v1/ticket-history',
                {
                    method: 'POST',
                    headers: headers,
                    body: requestBody,
                }
            );

            console.log('History response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('History entry created successfully:', result);
                // Refetch history after creating new entry
                await fetchHistory();
                return result;
            } else {
                // Get response text first to see what the server is actually returning
                const responseText = await response.text();
                console.error('Raw server response:', responseText);
                
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse error response as JSON:', parseError);
                    errorData = { message: `Server returned: ${responseText}` };
                }
                
                console.error('Error creating history entry:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    error: errorData,
                    requestBody: entry
                });
                
                // Don't show toast for history errors since they're not critical
                throw new Error(`Error del servidor (${response.status}): ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error creating history entry:', error);
            // Re-throw so the calling function can handle it
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