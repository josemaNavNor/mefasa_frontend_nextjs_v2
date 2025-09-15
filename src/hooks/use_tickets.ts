import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

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

    useEffect(() => {
        fetchTickets();
    }, []);

    return { tickets, loading, createTicket, updateTicket, fetchTicketById, refetch };
}