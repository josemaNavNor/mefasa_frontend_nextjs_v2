import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'
import * as XLSX from 'xlsx'

export function useTickets() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchTickets() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/tickets");
            const data = await response.json();
            setTickets(data.flat());
            console.log(data);
        } catch (error) {
            console.error("Error al obtener los tickets:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchTicketById(id: string) {
        setLoading(true);
        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/tickets/${id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error al obtener el ticket:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function updateTicket(id: string, ticket: { summary?: string, description?: string, technician_id?: number, type_id?: number, priority?: string, status?: string, floor_id?: number, area_id?: number, due_date?: string }) {
        setLoading(true);
        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/tickets/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ticket),
            });
            const data = await response.json();

            if (response.ok) {
                setTickets((prevTickets) => 
                    prevTickets.map(t => t.id === id ? { ...t, ...data } : t)
                );
                eventEmitter.emit('data-changed', 'tickets');
                eventEmitter.emit('tickets-updated');
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket actualizado',
                    text: `${data.message || 'Ticket actualizado correctamente'}`,
                });
                return data;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el ticket',
                    text: `${data.message || ''}`,
                });
                return null;
            }
        } catch (error) {
            console.error("Error al actualizar el ticket:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el ticket',
            });
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function createTicket(ticket: { ticket_number: string, summary: string, description: string, end_user_id: number, technician_id: number, type_id: number, priority: string, status: string, floor_id: number, area_id: number, due_date: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ticket),
            });
            const data = await response.json();

            if (response.ok) {
                setTickets((prevTickets) => [...prevTickets, data]);
                eventEmitter.emit('data-changed', 'tickets');
                eventEmitter.emit('tickets-updated');
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el ticket',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el ticket:", error);
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
                'Usuario Final': ticket.end_user ? 
                    `${ticket.end_user.name} ${ticket.end_user.last_name}` : 
                    'Sin asignar',
                'Email Usuario': ticket.end_user?.email || '',
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
                { wch: 30 }, // email Usuario
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

            Swal.fire({
                icon: 'success',
                title: 'Exportación exitosa',
                text: `Se han exportado ${dataToExport.length} tickets a Excel`,
                timer: 3000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error en la exportación',
                text: 'No se pudo exportar el archivo Excel',
            });
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return { tickets, loading, createTicket, updateTicket, fetchTicketById, refetch, exportToExcel };
}