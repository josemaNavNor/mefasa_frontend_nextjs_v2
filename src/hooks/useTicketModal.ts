"use client"

import { useState, useEffect, useMemo } from "react"
import { useTicketComments } from "@/hooks/useTicketsComments"
import { useTicketHistory } from "@/hooks/useTicketHistory"
import { useTickets } from "@/hooks/useTickets"
import { useUsers } from "@/hooks/useUsersAdmin"
import { useType } from "@/hooks/useTypeTickets"
import { useFloors } from "@/hooks/useFloors"
import Notiflix from 'notiflix';
import { createHistoryDescription, getCurrentUserId } from "@/lib/ticket-utils"
import { Ticket } from "@/types/ticket"
import { eventEmitter } from "./useEventListener"
import { TICKET_EVENTS } from "@/lib/events"

export const useTicketModal = (ticket: Ticket | null) => {
    const [responseText, setResponseText] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [localTicketUpdates, setLocalTicketUpdates] = useState<Partial<Ticket>>({})
    const [markedAsViewedTickets, setMarkedAsViewedTickets] = useState<Set<string | number>>(new Set())
    
    // Derivar ticketData del ticket prop y actualizaciones locales
    const ticketData = useMemo(() => {
        if (!ticket) return null;
        return { ...ticket, ...localTicketUpdates };
    }, [ticket, localTicketUpdates]);

    const { comments, loading, createComment } = useTicketComments(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { updateTicket, markTicketAsViewed } = useTickets()
    const { history, createHistoryEntry } = useTicketHistory(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { users } = useUsers()
    const { types } = useType()
    const { floors } = useFloors()

    // Inicializar usuario actual
    useEffect(() => {
        setCurrentUserId(getCurrentUserId())
    }, [])

    // Limpiar actualizaciones locales cuando cambie el ticket
    useEffect(() => {
        if (ticket) {
            setLocalTicketUpdates({})
            
            // Marcar ticket como visto cuando se abre el modal (solo una vez por ticket)
            if (ticket.id) {
                const ticketId = typeof ticket.id === 'string' ? ticket.id : ticket.id.toString()
                const ticketIdKey = ticket.id.toString()
                
                // Solo marcar como visto si no lo hemos hecho antes
                if (!markedAsViewedTickets.has(ticketIdKey)) {
                    markTicketAsViewed(ticketId)
                    setMarkedAsViewedTickets(prev => new Set(prev).add(ticketIdKey))
                }
            }
        }
    }, [ticket?.id, markTicketAsViewed]) // Solo depender del ID del ticket

    const handleTicketUpdate = async (field: string, newValue: any, oldValue: any) => {
        if (!ticket || !currentUserId) {
            console.error('Usuario o ticket no identificado', { ticket: !!ticket, currentUserId })
            return
        }

        try {
            const updateData = { [field]: newValue }
            const result = await updateTicket(ticket.id.toString(), updateData)
            
            if (result) {
                setLocalTicketUpdates((prev) => ({ ...prev, [field]: newValue }))
                
                // Crear entrada en el historial solo si el valor realmente cambió
                if (oldValue !== newValue) {
                    const historyData = {
                        ticket_id: typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id,
                        user_id: currentUserId,
                        action_type: `${field} modificado`,
                        description: createHistoryDescription(field, oldValue, newValue, users, types, floors),
                        old_values: { [field]: oldValue },
                        new_values: { [field]: newValue }
                    }
                    
                    // Emitir eventos específicos para actualizar la página de tickets
                    eventEmitter.emit(TICKET_EVENTS.UPDATED, { id: ticket.id, data: result });
                    eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
                }

                Notiflix.Notify.success(`Campo actualizado correctamente`)
            } else {
                Notiflix.Notify.failure('No se pudo actualizar el ticket')
            }
        } catch (error) {
            console.error('Error actualizando ticket:', error)
            Notiflix.Notify.failure('Error al actualizar el ticket')
        }
    }

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!responseText.trim()) {
            Notiflix.Notify.warning('Por favor escribe un comentario')
            return
        }

        if (!currentUserId) {
            Notiflix.Notify.warning('Error: Usuario no identificado')
            return
        }

        try {
            await createComment({
                ticket_id: typeof ticket!.id === 'string' ? parseInt(ticket!.id) : ticket!.id,
                body: responseText,
                technician_id: currentUserId
            })

            setResponseText("")
            setSelectedFiles([])
            //Notiflix.Notify.success('Comentario enviado correctamente')

        } catch (error) {
            console.error('Error al enviar respuesta:', error)
            Notiflix.Notify.failure('Error al enviar comentario')
        }
    }

    // Cleanup cuando el ticket cambie o se cierre el modal
    useEffect(() => {
        return () => {
            // Solo limpiar si el ticket es null (modal cerrado)
            if (!ticket) {
                setMarkedAsViewedTickets(new Set());
            }
        };
    }, [ticket]);

    return {
        responseText,
        setResponseText,
        selectedFiles,
        setSelectedFiles,
        ticketData,
        comments,
        loading,
        history,
        users,
        types,
        floors,
        handleTicketUpdate,
        handleSubmitResponse
    }
}