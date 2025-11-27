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
import { api } from "@/lib/httpClient"

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

    /**
     * Convierte un archivo a base64
     */
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    /**
     * Sube un archivo al servidor y retorna el ID del archivo creado
     */
    const uploadFile = async (file: File, ticketId: number): Promise<number> => {
        try {
            const base64Data = await fileToBase64(file);
            
            const uploadedFile = await api.post('/files', {
                filename: file.name,
                file_type: file.type,
                ticket_id: ticketId,
                file_data: base64Data,
            });

            if (!uploadedFile || !uploadedFile.id) {
                throw new Error(`No se recibió el ID del archivo subido para "${file.name}"`);
            }

            return uploadedFile.id;
        } catch (error) {
            throw new Error(
                error instanceof Error 
                    ? `Error al subir "${file.name}": ${error.message}`
                    : `Error al subir "${file.name}"`
            );
        }
    };

    /**
     * Crea la relación entre un comentario y sus archivos
     */
    const createCommentFileRelations = async (commentId: number, fileIds: number[]): Promise<void> => {
        if (fileIds.length === 0) return;

        try {
            const relations = fileIds.map(fileId => ({
                ticket_comment: commentId,
                file_id: fileId
            }));

            await api.post('/comments-files/bulk', relations);
        } catch (error) {
            console.error('Error al crear relaciones archivo-comentario:', error);
            throw new Error(
                error instanceof Error
                    ? `Error al vincular archivos al comentario: ${error.message}`
                    : 'Error al vincular archivos al comentario'
            );
        }
    };

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

        if (!ticket) {
            notifications.error('Error: No hay ticket seleccionado')
            return
        }

        const ticketId = typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id;

        try {
            // Crear el comentario primero
            const createdComment = await createComment({
                ticket_id: ticketId,
                body: responseText,
                technician_id: currentUserId
            });

            // Si hay archivos seleccionados, subirlos y crear las relaciones
            if (selectedFiles.length > 0 && createdComment && createdComment.id) {
                try {
                    // Subir todos los archivos en paralelo
                    const uploadPromises = selectedFiles.map(file => uploadFile(file, ticketId));
                    const fileIds = await Promise.all(uploadPromises);

                    // Crear las relaciones entre el comentario y los archivos
                    await createCommentFileRelations(
                        typeof createdComment.id === 'string' ? parseInt(createdComment.id) : createdComment.id,
                        fileIds
                    );

                    if (fileIds.length > 0) {
                        notifications.success(`Comentario enviado con ${fileIds.length} archivo(s) adjuntado(s) correctamente`);
                    }
                } catch (uploadError) {
                    // El comentario ya se creó, pero hubo error al subir archivos
                    console.error('Error al subir archivos:', uploadError);
                    notifications.warning(
                        uploadError instanceof Error 
                            ? `Comentario enviado, pero hubo problemas al adjuntar archivos: ${uploadError.message}`
                            : 'Comentario enviado, pero hubo problemas al adjuntar algunos archivos'
                    );
                }
            } else {
                // Si no hay archivos, mostrar notificación de éxito del comentario
                notifications.success('Comentario enviado correctamente');
            }

            setResponseText("")
            setSelectedFiles([])

        } catch (error) {
            console.error('Error al enviar respuesta:', error)
            notifications.error(
                error instanceof Error 
                    ? `Error al enviar comentario: ${error.message}`
                    : 'Error al enviar comentario'
            )
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