import { useState, useEffect } from "react"
import Swal from 'sweetalert2'

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

    async function createTicket(ticket: { ticket_number: string, summary: string, description: string, end_user_id: number, technician_id: number, type_id: number, priority: string, status: string, due_date: string }) {
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
            //console.log(data);
            setTickets((prevTickets) => [...prevTickets, data]);

            if (response.ok) {
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

    useEffect(() => {
        fetchTickets();
    }, []);

    return { tickets, loading, createTicket };
}
