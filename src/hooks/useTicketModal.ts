"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTicketComments } from "@/hooks/useTicketsComments"
import { useTicketHistory } from "@/hooks/useTicketHistory"
import { useTicketsContext } from "@/contexts/TicketsContext"
import { useUsersMinimalContext } from "@/contexts/UsersMinimalContext"
import { useTypesContext } from "@/contexts/TypesContext"
import { useFloorsContext } from "@/contexts/FloorsContext"
import { notifications } from '@/lib/notifications';
import { createHistoryDescription, getCurrentUserId } from "@/lib/ticket-utils"
import { Ticket } from "@/types/ticket"
import { eventEmitter } from "./useEventListener"
import { TICKET_EVENTS } from "@/lib/events"

export const useTicketModal = (ticket: Ticket | null) => {
    const [responseText, setResponseText] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [localTicketUpdates, setLocalTicketUpdates] = useState<Partial<Ticket>>({})
    const markedAsViewedRef = useRef<Set<string | number>>(new Set())
    
    // Derivar ticketData del ticket prop y actualizaciones locales
    const ticketData = useMemo(() => {
        if (!ticket) return null;
        return { ...ticket, ...localTicketUpdates };
    }, [ticket, localTicketUpdates]);

    const { comments, loading, createComment } = useTicketComments(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { updateTicket, markTicketAsViewed } = useTicketsContext()
    const { history, createHistoryEntry } = useTicketHistory(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { users } = useUsersMinimalContext()
    const { types } = useTypesContext()
    const { floors } = useFloorsContext()

    // Inicializar usuario actual
    useEffect(() => {
        setCurrentUserId(getCurrentUserId())
    }, [])

    // Limpiar actualizaciones locales cuando cambie el ticket
    useEffect(() => {
        if (ticket?.id) {
            setLocalTicketUpdates({})
            
            // Marcar ticket como visto cuando se abre el modal (solo una vez por ticket)
            const ticketId = typeof ticket.id === 'string' ? ticket.id : ticket.id.toString()
            const ticketIdKey = ticket.id.toString()
            
            // Solo marcar como visto si no lo hemos hecho antes
            if (!markedAsViewedRef.current.has(ticketIdKey)) {
                markedAsViewedRef.current.add(ticketIdKey)
                markTicketAsViewed(ticketId)
            }
        }
    }, [ticket?.id]) // Solo depender del ID del ticket

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

                notifications.success(`Campo actualizado correctamente`)
            } else {
                notifications.error('No se pudo actualizar el ticket')
            }
        } catch (error) {
            console.error('Error actualizando ticket:', error)
            notifications.error('Error al actualizar el ticket')
        }
    }

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!responseText.trim()) {
            notifications.warning('Por favor escribe un comentario')
            return
        }

        if (!currentUserId) {
            notifications.warning('Error: Usuario no identificado')
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
            //notifications.success('Comentario enviado correctamente')

        } catch (error) {
            console.error('Error al enviar respuesta:', error)
            notifications.error('Error al enviar comentario')
        }
    }

    // Limpiar referencias cuando el ticket cambie a null (modal cerrado)
    useEffect(() => {
        if (!ticket) {
            markedAsViewedRef.current.clear();
        }
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