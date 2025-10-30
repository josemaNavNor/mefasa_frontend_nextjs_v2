"use client"

import { Settings, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { TicketHistoryItem } from "@/types/ticket"
import { useState, useEffect } from "react"
import { useEventListener } from "@/hooks/useEventListener"
import { Button } from "@/components/ui/button"

interface TicketHistoryProps {
    history: TicketHistoryItem[]
}

export function TicketHistory({ history }: TicketHistoryProps) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [showHistory, setShowHistory] = useState(() => {
        // Recuperar la preferencia del localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ticket-history-visible')
            return saved ? JSON.parse(saved) : true
        }
        return true
    })

    // Guardar la preferencia cuando cambie
    const toggleHistory = () => {
        const newValue = !showHistory
        setShowHistory(newValue)
        if (typeof window !== 'undefined') {
            localStorage.setItem('ticket-history-visible', JSON.stringify(newValue))
        }
    }

    useEventListener('ticket-history-updated', () => {
        setIsUpdating(true)
        setTimeout(() => {
            setIsUpdating(false)
        }, 1000)
    })
    return (
        <div className={`${showHistory ? 'w-72' : 'w-16'} flex-shrink-0 flex flex-col border rounded-lg transition-all duration-300 ease-in-out`}>
            <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-gray-700 flex items-center ${!showHistory ? 'hidden' : ''}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Historial de Acciones
                        {isUpdating && (
                            <RefreshCw className="h-3 w-3 ml-2 animate-spin text-blue-500" />
                        )}
                    </h3>
                    {!showHistory && (
                        <div className="flex items-center justify-center flex-1">
                            <Settings className="h-4 w-4 text-gray-600" />
                            {history && history.length > 0 && (
                                <span className="ml-1 text-xs bg-gray-200 text-gray-600 rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                                    {history.length}
                                </span>
                            )}
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleHistory}
                        className={`flex items-center gap-1 text-gray-600 hover:text-gray-800 h-auto p-1 ${!showHistory ? 'w-full justify-center' : ''}`}
                        title={showHistory ? 'Ocultar historial' : 'Mostrar historial'}
                    >
                        {showHistory ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                <span className="text-xs">Ocultar</span>
                            </>
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {showHistory && (
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
            )}
            
            {!showHistory && (
                <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-2">
                    <div className="text-center text-gray-500">
                        <Clock className="h-6 w-6 mx-auto opacity-50" />
                    </div>
                    {history && history.length > 0 && (
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">{history.length}</p>
                            <p className="text-xs text-gray-500">acciones</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}