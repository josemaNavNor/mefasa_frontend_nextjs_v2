"use client"

import { User } from "lucide-react"
import { TicketComment, Ticket } from "@/types/ticket"

interface TicketConversationProps {
    ticket: Ticket
    comments: TicketComment[]
    loading: boolean
}

export function TicketConversation({ ticket, comments, loading }: TicketConversationProps) {
    return (
        <div className="flex-1 flex flex-col border rounded-lg">
            <div className="p-3 bg-gray-100 border-b">
                <h3 className="font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Conversación del Ticket
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mensaje inicial del ticket */}
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-blue-700">
                            {ticket.end_user?.name} {ticket.end_user?.last_name}
                            ({ticket.end_user?.email})
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleString('es-ES')}
                        </span>
                    </div>
                    <p className="text-gray-700">{ticket.description || ticket.summary}</p>
                </div>

                {/* Comentarios */}
                {loading ? (
                    <div className="text-center py-4">
                        <p className="text-gray-500">Cargando comentarios...</p>
                    </div>
                ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-lg ${
                            comment.is_public ? 'bg-green-50' : 'bg-yellow-50'
                        }`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-medium ${
                                    comment.is_public ? 'text-green-700' : 'text-yellow-700'
                                }`}>
                                    {comment.users?.name} {comment.users?.last_name}
                                    {!comment.is_public && ' (Privado)'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString('es-ES')}
                                </span>
                            </div>
                            <p className="text-gray-700">{comment.body}</p>
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
        </div>
    )
}