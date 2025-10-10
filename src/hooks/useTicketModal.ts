"use client"

import { useState, useEffect } from "react"
import { useTicketComments } from "@/hooks/useTicketsComments"
import { useTicketHistory } from "@/hooks/useTicketHistory"
import { useTickets } from "@/hooks/use_tickets"
import { useUsers } from "@/hooks/useUsersAdmin"
import { useType } from "@/hooks/use_typeTickets"
import Notiflix from 'notiflix';
import { createHistoryDescription, getCurrentUserId } from "@/lib/ticket-utils"
import { Ticket } from "@/types/ticket"
import { eventEmitter } from "./useEventListener"

export const useTicketModal = (ticket: Ticket | null) => {
    const [responseText, setResponseText] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isPublic, setIsPublic] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [ticketData, setTicketData] = useState(ticket)

    const { comments, loading, createComment } = useTicketComments(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { updateTicket } = useTickets()
    const { history, createHistoryEntry } = useTicketHistory(
        ticket?.id ? (typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id) : undefined
    )
    const { users } = useUsers()
    const { types } = useType()

    // Inicializar usuario actual
    useEffect(() => {
        setCurrentUserId(getCurrentUserId())
    }, [])

    // Actualizar datos del ticket cuando cambie el prop
    useEffect(() => {
        setTicketData(ticket)
    }, [ticket])

    const handleTicketUpdate = async (field: string, newValue: any, oldValue: any) => {
        if (!ticket || !currentUserId) {
            console.error('Usuario o ticket no identificado', { ticket: !!ticket, currentUserId })
            return
        }

        try {
            const updateData = { [field]: newValue }
            const result = await updateTicket(ticket.id.toString(), updateData)
            
            if (result) {
                setTicketData((prev: any) => ({ ...prev, [field]: newValue }))
                
                // Crear entrada en el historial
                const historyData = {
                    ticket_id: typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id,
                    user_id: currentUserId,
                    action_type: `${field} modificado`,
                    description: createHistoryDescription(field, oldValue, newValue, users, types),
                    old_values: { [field]: oldValue },
                    new_values: { [field]: newValue }
                }
                eventEmitter.emit('Ticket actualizado', historyData.ticket_id)

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
                technician_id: currentUserId,
                is_public: isPublic,
            })

            setResponseText("")
            setSelectedFiles([])
            //Notiflix.Notify.success('Comentario enviado correctamente')

        } catch (error) {
            console.error('Error al enviar respuesta:', error)
            Notiflix.Notify.failure('Error al enviar comentario')
        }
    }

    return {
        responseText,
        setResponseText,
        selectedFiles,
        setSelectedFiles,
        isPublic,
        setIsPublic,
        ticketData,
        comments,
        loading,
        history,
        users,
        types,
        handleTicketUpdate,
        handleSubmitResponse
    }
}