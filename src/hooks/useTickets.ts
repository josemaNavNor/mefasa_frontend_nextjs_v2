import { useState, useEffect, useCallback, useMemo } from "react"
import { notifications } from '@/lib/notifications';
import { eventEmitter } from './useEventListener'
import { TICKET_EVENTS, GLOBAL_EVENTS } from '@/lib/events'
import * as XLSX from 'xlsx'
import { api } from '@/lib/httpClient'
import { logger } from '@/lib/logger'
import { createTicketSchema, updateTicketSchema } from '@/lib/zod'
import type { Ticket, CreateTicketDto, UpdateTicketDto } from '@/types'
import { getCurrentUserEmail } from '@/lib/ticket-utils'

/**
 * Hook personalizado para gestionar tickets
 * Proporciona funciones para crear, actualizar, eliminar y obtener tickets
 * @returns Objeto con estado y funciones para gestionar tickets
 */
// Función helper para ordenar tickets por fecha de creación (más nuevo primero)
const sortTicketsByDate = (tickets: Ticket[]): Ticket[] => {
    return [...tickets].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Orden descendente (más nuevo primero)
    });
};

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastTicketCount, setLastTicketCount] = useState(0);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    /**
     * Obtiene todos los tickets con estado de visualización
     * @param showNotification - Si es true, muestra notificación cuando hay nuevos tickets
     * @returns Promise que se resuelve cuando se completan los tickets
     */
    const fetchTickets = useCallback(async (showNotification = false) => {
        // Implementar throttling para evitar múltiples llamadas muy seguidas
        const now = Date.now();
        if (now - lastFetchTime < 2000) { // Mínimo 2 segundos entre llamadas
            return;
        }
        setLastFetchTime(now);
        
        setLoading(true);
        try {
            // Usar el endpoint con estado de visualización
            const response = await api.get('/tickets/with-view-status');
            let newTickets: Ticket[] = [];
            
            if (Array.isArray(response)) {
                newTickets = response;
            } else if (response && Array.isArray(response.tickets)) {
                newTickets = response.tickets;
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                newTickets = [response];
            } else {
                logger.error('Unexpected data structure:', response);
                newTickets = [];
            }

            // Detectar nuevos tickets
            const currentCount = newTickets.length;
            
            if (lastTicketCount > 0 && currentCount > lastTicketCount && showNotification) {
                const newTicketsCount = currentCount - lastTicketCount;
                notifications.info(`¡${newTicketsCount} nuevo${newTicketsCount > 1 ? 's' : ''} ticket${newTicketsCount > 1 ? 's' : ''} registrado${newTicketsCount > 1 ? 's' : ''}!`);
            }
            
            // Transformar tickets: si el ticket tiene estructura con .ticket (del nuevo endpoint), extraer el ticket
            const transformedTickets = newTickets.map((item: Ticket & { ticket?: Ticket; isNew?: boolean; viewedAt?: Date }) => {
                if (item.ticket) {
                    // Agregar propiedades de visualización al ticket
                    return {
                        ...item.ticket,
                        isNew: item.isNew,
                        viewedAt: item.viewedAt
                    } as Ticket & { isNew?: boolean; viewedAt?: Date };
                }
                return item;
            });
            
            // Ordenar tickets por fecha de creación (más nuevo primero)
            const sortedTickets = sortTicketsByDate(transformedTickets);
            
            setTickets(sortedTickets);
            setLastTicketCount(currentCount);
            
        } catch (error) {
            notifications.error('Error al cargar tickets');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [lastFetchTime, lastTicketCount]);

    /**
     * Obtiene un ticket específico por su ID
     * @param id - ID del ticket a obtener
     * @returns Promise que se resuelve con el ticket o null si hay error
     */
    async function fetchTicketById(id: string) {
        setLoading(true);
        try {
            const response = await api.get(`/tickets/${id}/with-view-status`);
            
            return response;
        } catch (error) {
            notifications.error(
                error instanceof Error ? `Error al cargar ticket: ${error.message}` : 'Error al cargar ticket'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Marca un ticket como visto
     * @param id - ID del ticket a marcar como visto
     * @returns Promise que se resuelve con true si se marcó correctamente, false en caso contrario
     */
    async function markTicketAsViewed(id: string) {
        try {
            // Buscar el ticket en el estado local para verificar si ya está marcado como visto
            const ticketId = parseInt(id);
            const currentTicket = tickets.find(t => t.id === ticketId);
            
            // Si el ticket ya no es nuevo (ya fue visto), no hacer la llamada
            if (currentTicket && (currentTicket as Ticket & { isNew?: boolean }).isNew === false) {
                return true;
            }
            
            await api.post(`/tickets/${id}/mark-as-viewed`, {});
            
            // Actualizar el estado local del ticket
            setTickets((prevTickets) => 
                prevTickets.map(ticket => 
                    ticket.id === ticketId 
                        ? { ...ticket, isNew: false, viewedAt: new Date() } as Ticket & { isNew?: boolean; viewedAt?: Date }
                        : ticket
                )
            );
            
            return true;
        } catch (error) {
            logger.error("Error al marcar ticket como visto:", error);
            return false;
        }
    }

    /**
     * Actualiza un ticket existente
     * @param id - ID del ticket a actualizar
     * @param ticket - Datos parciales del ticket a actualizar
     * @returns Promise que se resuelve con el ticket actualizado o null si hay error
     */
    async function updateTicket(id: string, ticket: UpdateTicketDto) {
        setLoading(true);
        try {
            // Validar datos con Zod
            const validation = updateTicketSchema.safeParse(ticket);
            if (!validation.success) {
                const firstError = validation.error.issues[0];
                notifications.error(firstError?.message || 'Error de validación');
                return null;
            }

            const response = await api.patch(`/tickets/${id}`, validation.data);

            setTickets((prevTickets) => {
                const updatedTickets = prevTickets.map(t => t.id === Number(id) ? { ...t, ...response } : t);
                // Ordenar por fecha de creación usando la función helper
                return sortTicketsByDate(updatedTickets);
            });
            // Emitir eventos específicos para la página de tickets
            eventEmitter.emit(TICKET_EVENTS.UPDATED, { id, data: response });
            eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'tickets');
            eventEmitter.emit(GLOBAL_EVENTS.TICKETS_UPDATED);
            eventEmitter.emit('ticket-history-updated', parseInt(id));
            return response;
        } catch (error) {
            notifications.error(
                error instanceof Error ? `Error al actualizar el ticket: ${error.message}` : 'Error al actualizar el ticket'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Crea un nuevo ticket
     * El end_user se obtiene automáticamente del localStorage
     * @param ticket - Datos del ticket a crear
     * @returns Promise que se resuelve cuando se crea el ticket
     */
    async function createTicket(ticket: CreateTicketDto) {
        setLoading(true);
        try {
            // Obtener email del usuario del localStorage ANTES de validar
            const endUserEmail = getCurrentUserEmail();
            if (!endUserEmail) {
                notifications.error('No se pudo obtener el email del usuario autenticado. Por favor, inicia sesión nuevamente.');
                return;
            }

            // Preparar datos del ticket con el email del usuario
            const ticketDataWithEmail: CreateTicketDto = {
                ...ticket,
                end_user: endUserEmail // Usar siempre el email del localStorage
            };

            // Validar datos con Zod
            const validation = createTicketSchema.safeParse(ticketDataWithEmail);
            if (!validation.success) {
                const firstError = validation.error.issues[0];
                notifications.error(firstError?.message || 'Error de validación');
                return;
            }
            
            const response = await api.post('/tickets', validation.data);

            // En lugar de agregar el ticket básico, refrescar toda la lista para obtener los datos completos
            await fetchTickets();
            
            // Emitir eventos específicos para la página de tickets
            eventEmitter.emit(TICKET_EVENTS.CREATED, response);
            eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'tickets');
            eventEmitter.emit(GLOBAL_EVENTS.TICKETS_UPDATED);
            notifications.success(`Ticket creado correctamente`);
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                throw error;
            }
            notifications.error(
                error instanceof Error ? `Error al crear el ticket: ${error.message}` : 'Error al crear el ticket'
            );
        } finally {
            setLoading(false);
        }
    }

    /**
     * Elimina un ticket
     * @param id - ID del ticket a eliminar (puede ser string o number)
     * @returns Promise que se resuelve con true si se eliminó correctamente, false en caso contrario
     */
    async function deleteTicket(id: string | number) {
        setLoading(true);
        try {
            // Convertir a string para la URL (las rutas HTTP siempre usan strings)
            const idString = String(id);
            await api.delete(`/tickets/${idString}`);
            // Comparar ambos como strings para el filtro
            setTickets((prevTickets) => prevTickets.filter((ticket) => String(ticket.id) !== idString));
            // Emitir eventos específicos para la página de tickets
            eventEmitter.emit(TICKET_EVENTS.DELETED, { id: idString });
            eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'tickets');
            eventEmitter.emit(GLOBAL_EVENTS.TICKETS_UPDATED);
            notifications.success('Ticket eliminado correctamente');
            return true;
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                return false;
            }
            notifications.error(
                error instanceof Error ? `Error al eliminar el ticket: ${error.message}` : 'Error al eliminar el ticket: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Recarga los tickets desde el servidor
     */
    const refetch = () => {
        fetchTickets();
    };

    /**
     * Exporta tickets a un archivo Excel
     * @param ticketsToExport - Array de tickets a exportar (por defecto todos los tickets)
     */
    const exportToExcel = (ticketsToExport = tickets) => {
        try {
            // datos a exportar
            const dataToExport = ticketsToExport.map((ticket: Ticket) => ({
                'Número de Ticket': ticket.ticket_number || '',
                'Título': ticket.summary || '',
                'Descripción': ticket.description || '',
                'Usuario Final': ticket.end_user || 'Sin asignar',
                'Técnico Asignado': ticket.technician ?
                    `${ticket.technician.name} ${ticket.technician.last_name}` :
                    'Sin asignar',
                'Tipo': (ticket as Ticket & { type?: { type_name: string } }).type?.type_name || 'Sin tipo',
                'Prioridad': ticket.priority || '',
                'Estado': ticket.status || '',
                'Piso': ticket.floor?.floor_name || 'Sin piso',
                'Área': (ticket as Ticket & { area?: { area_name: string } }).area?.area_name || 'Sin área',
                'Fecha de Creación': ticket.created_at ?
                    new Date(ticket.created_at).toLocaleString('es-ES') :
                    '',
                'Fecha de Actualización': (ticket as Ticket & { updated_at?: string }).updated_at ?
                    new Date((ticket as Ticket & { updated_at?: string }).updated_at!).toLocaleString('es-ES') :
                    '',
                'Fecha Límite': ticket.due_date ?
                    new Date(ticket.due_date).toLocaleDateString('es-ES') :
                    'No establecida',
                'Fecha de Asignación': (ticket as Ticket & { assigned_at?: string }).assigned_at ?
                    new Date((ticket as Ticket & { assigned_at?: string }).assigned_at!).toLocaleString('es-ES') :
                    '',
                'Fecha de Cierre': (ticket as Ticket & { closed_at?: string }).closed_at ?
                    new Date((ticket as Ticket & { closed_at?: string }).closed_at!).toLocaleString('es-ES') :
                    ''
            }));

            // Crear el libro de Excel
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Ajustar el ancho de las columnas
            const columnWidths = [
                { wch: 15 }, // numero de Ticket
                { wch: 30 }, // titulo
                { wch: 50 }, // descripcion
                { wch: 25 }, // usuario Final
                { wch: 25 }, // tecnico Asignado
                { wch: 20 }, // tipo
                { wch: 12 }, // prioridad
                { wch: 15 }, // estado
                { wch: 15 }, // piso
                { wch: 15 }, // area
                { wch: 20 }, // fecha de Creación
                { wch: 20 }, // fecha de Actualización
                { wch: 15 }, // fecha Límite
                { wch: 20 }, // fecha de Asignación
                { wch: 20 }, // fecha de Resolución
                { wch: 20 }  // fecha de Cierre
            ];
            worksheet['!cols'] = columnWidths;

            // Agregar la hoja al libro
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

            // Generar el nombre del archivo con fecha y hora actual
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
            const filename = `hdm_export_${timestamp}.xlsx`;

            // Descargar el archivo
            XLSX.writeFile(workbook, filename);

            notifications.success(`Se han exportado ${dataToExport.length} tickets a Excel`);

        } catch (error) {
            logger.error('Error al exportar a Excel:', error);
            notifications.error('Error al exportar a Excel');
        }
    };

    useEffect(() => {
        // Cargar tickets inicial
        fetchTickets();
    }, [fetchTickets]);

    return { 
        tickets, 
        loading, 
        createTicket, 
        updateTicket, 
        deleteTicket, 
        fetchTicketById, 
        markTicketAsViewed,
        refetch, 
        exportToExcel
    };
}

