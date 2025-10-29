import { useState, useEffect } from "react"
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'
import * as XLSX from 'xlsx'
import { api } from '@/lib/httpClient'
import { useSettings } from '@/contexts/SettingsContext'

export function useTickets() {
    const { autoRefreshEnabled, autoRefreshInterval } = useSettings();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastTicketCount, setLastTicketCount] = useState(0);
    const [isPolling, setIsPolling] = useState(false);

    async function fetchTickets(showNotification = false) {
        if (!isPolling) setLoading(true);
        try {
            const response = await api.get('/tickets');
            let newTickets: any[] = [];
            
            if (Array.isArray(response)) {
                newTickets = response;
            } else if (response && Array.isArray(response.tickets)) {
                newTickets = response.tickets;
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                newTickets = [response];
            } else {
                console.error('Unexpected data structure:', response);
                newTickets = [];
            }

            // Detectar nuevos tickets
            const currentCount = newTickets.length;
            // console.log('Polling check:', { 
            //     currentCount, 
            //     lastTicketCount, 
            //     showNotification, 
            //     isNewTicket: currentCount > lastTicketCount 
            // });
            
            if (lastTicketCount > 0 && currentCount > lastTicketCount && showNotification) {
                const newTicketsCount = currentCount - lastTicketCount;
                //console.log(`Ticket  ${newTicketsCount} new tickets`);
                Notiflix.Notify.info(`¡${newTicketsCount} nuevo${newTicketsCount > 1 ? 's' : ''} ticket${newTicketsCount > 1 ? 's' : ''} registrado${newTicketsCount > 1 ? 's' : ''}!`);
            }
            
            // Ordenar tickets por fecha de creación (más nuevo primero)
            const sortedTickets = newTickets.sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA; // Orden descendente (más nuevo primero)
            });
            
            setTickets(sortedTickets);
            setLastTicketCount(currentCount);
            
        } catch (error) {
            //console.error("Error al obtener los tickets:", error);
            if (!isPolling) {
                Notiflix.Notify.failure('Error al cargar tickets');
                setTickets([]);
            }
        } finally {
            if (!isPolling) setLoading(false);
        }
    }

    async function fetchTicketById(id: string) {
        setLoading(true);
        try {
            const response = await api.get(`/tickets/${id}`);
            
            return response;
        } catch (error) {
            //console.error("Error al obtener el ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al cargar ticket: ${error.message}` : 'Error al cargar ticket'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function updateTicket(id: string, ticket: { summary?: string, description?: string, technician_id?: number, type_id?: number, priority?: string, status?: string, floor_id?: number, area_id?: number, due_date?: string }) {
        setLoading(true);
        try {
            const response = await api.patch(`/tickets/${id}`, ticket);

            setTickets((prevTickets) => {
                const updatedTickets = prevTickets.map(t => t.id === id ? { ...t, ...response } : t);
                // Ordenamien por fecha de creacio
                return updatedTickets.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA; // Orden descendente
                });
            });
            eventEmitter.emit('data-changed', 'tickets');
            eventEmitter.emit('tickets-updated');
            eventEmitter.emit('ticket-history-updated', parseInt(id));
            return response;
        } catch (error) {
            //console.error("Error al actualizar el ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al actualizar el ticket: ${error.message}` : 'Error al actualizar el ticket'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function createTicket(ticket: { ticket_number: string, summary: string, description: string, end_user: string, technician_id: number, type_id: number, priority: string, status: string, floor_id: number, area_id: number, due_date: string }) {
        setLoading(true);
        try {
            const response = await api.post('/tickets', ticket);

            setTickets((prevTickets) => {
                const updatedTickets = [...prevTickets, response];
                // Mantener el ordenamiento por fecha de creación (más nuevo primero)
                return updatedTickets.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA; // Orden descendente
                });
            });
            eventEmitter.emit('data-changed', 'tickets');
            eventEmitter.emit('tickets-updated');
            Notiflix.Notify.success(`Ticket ${ticket.ticket_number} creado correctamente`);
        } catch (error) {
            //console.error("Error al crear el ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al crear el ticket: ${error.message}` : 'Error al crear el ticket'
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteTicket(id: string) {
        setLoading(true);
        try {
            await api.delete(`/tickets/${id}`);
            setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== id));
            eventEmitter.emit('data-changed', 'tickets');
            eventEmitter.emit('tickets-updated');
            Notiflix.Notify.success('Ticket eliminado correctamente');
            return true;
        } catch (error) {
            //console.error("Error al eliminar el ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al eliminar el ticket: ${error.message}` : 'Error al eliminar el ticket: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchTickets();
    };

    const exportToExcel = (ticketsToExport = tickets) => {
        try {
            // datos a exportar
            const dataToExport = ticketsToExport.map((ticket: any) => ({
                'Número de Ticket': ticket.ticket_number || '',
                'Título': ticket.summary || '',
                'Descripción': ticket.description || '',
                'Usuario Final': ticket.end_user || 'Sin asignar',
                'Técnico Asignado': ticket.technician ?
                    `${ticket.technician.name} ${ticket.technician.last_name}` :
                    'Sin asignar',
                'Tipo': ticket.type?.type_name || 'Sin tipo',
                'Prioridad': ticket.priority || '',
                'Estado': ticket.status || '',
                'Piso': ticket.floor?.floor_name || 'Sin piso',
                'Área': ticket.area?.area_name || 'Sin área',
                'Fecha de Creación': ticket.created_at ?
                    new Date(ticket.created_at).toLocaleString('es-ES') :
                    '',
                'Fecha de Actualización': ticket.updated_at ?
                    new Date(ticket.updated_at).toLocaleString('es-ES') :
                    '',
                'Fecha Límite': ticket.due_date ?
                    new Date(ticket.due_date).toLocaleDateString('es-ES') :
                    'No establecida',
                'Fecha de Asignación': ticket.assigned_at ?
                    new Date(ticket.assigned_at).toLocaleString('es-ES') :
                    '',
                'Fecha de Resolución': ticket.resolved_at ?
                    new Date(ticket.resolved_at).toLocaleString('es-ES') :
                    '',
                'Fecha de Cierre': ticket.closed_at ?
                    new Date(ticket.closed_at).toLocaleString('es-ES') :
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

            Notiflix.Notify.success(`Se han exportado ${dataToExport.length} tickets a Excel`);

        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            Notiflix.Notify.failure('Error al exportar a Excel');
        }
    };

    useEffect(() => {
        // Cargar tickets inicial
        fetchTickets();
        
        let pollingInterval: NodeJS.Timeout | null = null;
        
        // Solo iniciar polling si está habilitado en configuraciones
        if (autoRefreshEnabled) {
            setIsPolling(true);
            console.log(`Empezando polling cada ${autoRefreshInterval / 1000} segundos`);
            pollingInterval = setInterval(() => {
                fetchTickets(true); // true para mostrar notificaciones de nuevos tickets
            }, autoRefreshInterval);
        } else {
            setIsPolling(false);
            console.log('Auto-refresh is disabled');
        }
        
        // Cleanup: detener el polling cuando el componente se desmonte o cambien las configuraciones
        return () => {
            setIsPolling(false);
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [autoRefreshEnabled, autoRefreshInterval]);

    return { 
        tickets, 
        loading, 
        createTicket, 
        updateTicket, 
        deleteTicket, 
        fetchTicketById, 
        refetch, 
        exportToExcel,
        isPolling
    };
}

