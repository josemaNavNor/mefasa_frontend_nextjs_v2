"use client"

import { User, ChevronDown, ChevronUp } from "lucide-react"
import { TicketComment, Ticket } from "@/types/ticket"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TicketConversationProps {
    ticket: Ticket
    comments: TicketComment[]
    loading: boolean
}

export function TicketConversation({ ticket, comments, loading }: TicketConversationProps) {
    const [showHistory, setShowHistory] = useState(true)

    return (
        <div className="flex-1 flex flex-col border rounded-lg min-w-0">
            <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Conversación del Ticket
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                    >
                        {showHistory ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Ocultar historial
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Mostrar historial
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {showHistory && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="p-3 bg-blue-100 border-l-4 border-blue-400 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-blue-800">
                                ({ticket.end_user ? ticket.end_user : 'Usuario desconocido'})
                            </span>
                            <span className="text-xs text-gray-600">
                                {new Date(ticket.created_at).toLocaleString('es-ES')}
                            </span>
                        </div>
                        <p className="text-gray-800">{ticket.description || ticket.summary}</p>
                    </div>

                    {/* Conversacion */}
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Cargando comentarios...</p>
                        </div>
                    ) : comments && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className={`p-3 rounded-lg border-l-4 ${
                                comment.is_public 
                                    ? 'bg-green-100 border-green-400' 
                                    : 'bg-amber-100 border-amber-400'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`font-medium ${
                                        comment.is_public ? 'text-green-800' : 'text-amber-800'
                                    }`}>
                                        {comment.users?.name && comment.users?.last_name 
                                            ? `${comment.users.name} ${comment.users.last_name}` 
                                            : comment.users?.email || 'Usuario desconocido'}
                                        {!comment.is_public && ' (Privado)'}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {new Date(comment.created_at).toLocaleString('es-ES')}
                                    </span>
                                </div>
                                <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: comment.body }} />
                                {comment.comments_files && comment.comments_files.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-500">
                                            {comment.comments_files.length} archivo(s) adjunto(s)
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            <p>No hay comentarios adicionales</p>
                        </div>
                    )}
                </div>
            )}
            
            {!showHistory && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Historial de conversación oculto</p>
                        <p className="text-sm">Haz clic en "Mostrar historial" para ver los comentarios</p>
                    </div>
                </div>
            )}
        </div>
    )
}