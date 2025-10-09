"use client"

import { Settings, Clock, RefreshCw } from "lucide-react"
import { TicketHistoryItem } from "@/types/ticket"
import { useState, useEffect } from "react"
import { useEventListener } from "@/hooks/useEventListener"

interface TicketHistoryProps {
    history: TicketHistoryItem[]
}

export function TicketHistory({ history }: TicketHistoryProps) {
    const [isUpdating, setIsUpdating] = useState(false)

    useEventListener('ticket-history-updated', () => {
        setIsUpdating(true)
        setTimeout(() => {
            setIsUpdating(false)
        }, 1000)
    })
    return (
        <div className="w-72 flex-shrink-0 flex flex-col border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-700 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Historial de Acciones
                    {isUpdating && (
                        <RefreshCw className="h-3 w-3 ml-2 animate-spin text-blue-500" />
                    )}
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {history && history.length > 0 ? (
                        history.map((historyItem) => (
                            <div key={historyItem.id} className="border-l-2 border-gray-200 pl-3 pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-800">
                                            {historyItem.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {historyItem.description}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-2">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(historyItem.created_at).toLocaleString('es-ES')}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            por {historyItem.user ? `${historyItem.user.name} ${historyItem.user.last_name}` : 'Sistema'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            <p>No hay historial disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}