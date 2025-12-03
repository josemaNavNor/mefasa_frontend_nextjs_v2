"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { TicketBasicInfo } from "@/components/ticket/ticket-basic-info"
import { TicketConversation } from "@/components/ticket/ticket-conversation"
import { TicketHistory } from "@/components/ticket/ticket-history"
import { TicketResponseForm } from "@/components/ticket/ticket-response-form"
import { useTicketModal } from "@/hooks/useTicketModal"
import { useTicketsContext } from "@/contexts/TicketsContext"
import { Ticket } from "@/types/ticket"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function TicketDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { fetchTicketById, loading: contextLoading } = useTicketsContext()
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)

    const ticketId = params?.ticketId as string

    // Obtener el ticket cuando se carga la página
    useEffect(() => {
        const loadTicket = async () => {
            if (!ticketId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const fetchedTicket = await fetchTicketById(ticketId)
                if (fetchedTicket) {
                    // Si el ticket viene con estructura anidada, extraerlo
                    const ticketData = (fetchedTicket as any).ticket || fetchedTicket
                    setTicket(ticketData as Ticket)
                } else {
                    // Si no se encuentra el ticket, redirigir a la lista
                    router.push('/tickets')
                }
            } catch (error) {
                console.error('Error al cargar ticket:', error)
                router.push('/tickets')
            } finally {
                setLoading(false)
            }
        }

        loadTicket()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]) // Solo dependemos de ticketId para evitar re-renders constantes

    const {
        responseText,
        setResponseText,
        selectedFiles,
        setSelectedFiles,
        ticketData,
        comments,
        loading: commentsLoading,
        history,
        users,
        types,
        handleTicketUpdate,
        handleSubmitResponse,
        floors
    } = useTicketModal(ticket)

    // Memoizar el callback para limpiar el formulario
    const handleCloseForm = useCallback(() => {
        setResponseText("")
        setSelectedFiles([])
    }, [setResponseText, setSelectedFiles])

    // Mostrar loading mientras se carga el ticket
    if (loading || contextLoading || !ticket) {
        return (
            <div className="w-full px-4 py-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Cargando ticket...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 py-4">
            {/* Header con botón de volver */}
            <div className="mb-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tickets')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a tickets
                </Button>
                <h1 className="text-2xl font-bold">
                    #{ticket.ticket_number} - {ticket.summary}
                </h1>
            </div>

            {/* Contenido principal dividido en tres columnas */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-200px)]">
                {/* Conversación del ticket */}
                <div className="flex-1 min-w-0">
                    <TicketConversation 
                        ticket={ticket}
                        comments={comments}
                        loading={commentsLoading}
                    />
                </div>

                {/* Historial de acciones */}
                <div className="flex-shrink-0">
                    <TicketHistory history={history} />
                </div>

                {/* Información básica del ticket */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    {ticketData && (
                        <TicketBasicInfo 
                            ticket={ticketData} 
                            users={users}
                            types={types}
                            floors={floors}
                            onTicketUpdate={handleTicketUpdate} 
                        />
                    )}
                </div>
            </div>

            {/* Formulario para nueva respuesta */}
            <div className="mt-4">
                <TicketResponseForm
                    responseText={responseText}
                    setResponseText={setResponseText}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    onSubmit={handleSubmitResponse}
                    onClose={handleCloseForm}
                />
            </div>
        </div>
    )
}

