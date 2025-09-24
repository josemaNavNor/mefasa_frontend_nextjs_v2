"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Paperclip, X, Clock, User, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useTicketComments } from "@/hooks/useTicketsComments"
import { toast } from "sonner"

interface TicketDetailsModalProps {
    ticket: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Mock data para el historial de acciones (reemplazar con datos reales)
const mockSystemActions = [
    {
        id: 1,
        action: "Ticket creado",
        user: "Sistema",
        timestamp: "2024-01-15 10:30:00",
        details: "Ticket #1234 creado por usuario@email.com"
    },
    {
        id: 2,
        action: "Ticket asignado",
        user: "Juan Pérez",
        timestamp: "2024-01-15 11:00:00",
        details: "Ticket #1234 asignado a María González"
    },
    {
        id: 3,
        action: "Estado cambiado",
        user: "María González",
        timestamp: "2024-01-15 14:30:00",
        details: "Estado cambiado de 'Nuevo' a 'En progreso'"
    },
    {
        id: 4,
        action: "Prioridad modificada",
        user: "Juan Pérez",
        timestamp: "2024-01-15 16:00:00",
        details: "Prioridad cambiada de 'Media' a 'Alta'"
    }
];

export function TicketDetailsModal({ 
    ticket, 
    open, 
    onOpenChange 
}: TicketDetailsModalProps) {
    const [responseText, setResponseText] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isPublic, setIsPublic] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    const { comments, loading, createComment, fetchCommentsByTicket } = useTicketComments(
        ticket?.id ? parseInt(ticket.id) : undefined
    );

    // Obtener el ID del usuario actual
    useEffect(() => {
        const userId = localStorage.getItem('userId') || '2';
        setCurrentUserId(parseInt(userId));
    }, []);

    if (!ticket) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!responseText.trim()) {
            toast.error('Por favor escribe un comentario');
            return;
        }

        if (!currentUserId) {
            toast.error('Error: Usuario no identificado');
            return;
        }

        try {
            await createComment({
                ticket_id: parseInt(ticket.id),
                body: responseText,
                technician_id: currentUserId,
                is_public: isPublic,
            });

            setResponseText("")
            setSelectedFiles([])
            
        } catch (error) {
            console.error('Error al enviar respuesta:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        #{ticket.ticket_number} - {ticket.summary}
                    </DialogTitle>
                </DialogHeader>
                
                {/* Información básica del ticket */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Estado:</span> {ticket.status || "Sin estado"}
                        </div>
                        <div>
                            <span className="font-medium">Prioridad:</span> {ticket.priority || "Sin prioridad"}
                        </div>
                        <div>
                            <span className="font-medium">Creador:</span> {ticket.end_user?.email || "Sin creador"}
                        </div>
                        <div>
                            <span className="font-medium">Asignado a:</span> {
                                ticket.technician 
                                    ? `${ticket.technician.name} ${ticket.technician.last_name}`
                                    : "Sin asignar"
                            }
                        </div>
                    </div>
                </div>

                {/* Contenido principal dividido en dos columnas */}
                <div className="flex-1 overflow-hidden flex gap-4">
                    {/* Columna izquierda - Chat/Conversación */}
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

                            {/* Comentarios existentes */}
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

                    {/* Columna derecha - Historial de acciones del sistema */}
                    <div className="w-80 flex flex-col border rounded-lg">
                        <div className="p-3 bg-gray-100 border-b">
                            <h3 className="font-semibold flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Historial de Acciones
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {mockSystemActions.map((action) => (
                                    <div key={action.id} className="border-l-2 border-gray-200 pl-3 pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-gray-800">
                                                    {action.action}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {action.details}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(action.timestamp).toLocaleString('es-ES')}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    por {action.user}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulario para nueva respuesta */}
                <div className="border-t pt-4 mt-4">
                    <form onSubmit={handleSubmitResponse} className="space-y-4">
                        <div>
                            <Label htmlFor="response">Escribir respuesta</Label>
                            <Textarea
                                id="response"
                                placeholder="Escribe tu respuesta aquí..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="min-h-[80px] resize-none"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Input para archivos */}
                                <div>
                                    <Input
                                        id="files"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('files')?.click()}
                                    >
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        Adjuntar
                                    </Button>
                                    {selectedFiles.length > 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            {selectedFiles.length} archivo(s)
                                        </span>
                                    )}
                                </div>

                                {/* Checkbox para comentario público/privado */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="isPublic" className="text-sm">
                                        Comentario público
                                    </Label>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!responseText.trim()}
                                    className="flex items-center"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar
                                </Button>
                            </div>
                        </div>

                        {/* Lista de archivos seleccionados */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-1">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                        <span className="truncate">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}