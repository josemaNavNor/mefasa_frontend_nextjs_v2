"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { TicketBasicInfo } from "@/components/ticket/ticket-basic-info"
import { TicketConversation } from "@/components/ticket/ticket-conversation"
import { TicketHistory } from "@/components/ticket/ticket-history"
import { TicketResponseForm } from "@/components/ticket/ticket-response-form"
import { useTicketModal } from "@/hooks/useTicketModal"
import { Ticket } from "@/types/ticket"

interface TicketDetailsModalProps {
    ticket: Ticket | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TicketDetailsModal({
    ticket,
    open,
    onOpenChange
}: TicketDetailsModalProps) {
    const {
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
    } = useTicketModal(ticket)

    if (!ticket) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        #{ticket.ticket_number} - {ticket.summary}
                    </DialogTitle>
                </DialogHeader>

                {/* Información básica del ticket */}
                {ticketData && (
                    <TicketBasicInfo 
                        ticket={ticketData} 
                        users={users}
                        types={types}
                        onTicketUpdate={handleTicketUpdate} 
                    />
                )}

                {/* Contenido principal dividido en dos columnas */}
                <div className="flex-1 overflow-hidden flex gap-4">
                    {/* Conversación del ticket */}
                    <TicketConversation 
                        ticket={ticket}
                        comments={comments}
                        loading={loading}
                    />

                    {/* Historial de acciones */}
                    <TicketHistory history={history} />
                </div>

                {/* Formulario para nueva respuesta */}
                <TicketResponseForm
                    responseText={responseText}
                    setResponseText={setResponseText}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    isPublic={isPublic}
                    setIsPublic={setIsPublic}
                    onSubmit={handleSubmitResponse}
                    onClose={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}