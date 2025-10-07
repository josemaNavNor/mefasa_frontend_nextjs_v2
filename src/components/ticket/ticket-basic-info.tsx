"use client"

import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Edit2, Check, X as XIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Ticket, User, TicketType } from "@/types/ticket"

interface TicketBasicInfoProps {
    ticket: Ticket
    users: User[]
    types: TicketType[]
    onTicketUpdate: (field: string, newValue: any, oldValue: any) => void
}

export function TicketBasicInfo({ ticket, users, types, onTicketUpdate }: TicketBasicInfoProps) {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValues, setTempValues] = useState<{ [key: string]: any }>({})
    const [calendarOpen, setCalendarOpen] = useState(false)

    const handleEdit = (field: string, currentValue: any) => {
        setEditingField(field)
        setTempValues({ ...tempValues, [field]: currentValue })
    }

    const handleSave = async (field: string) => {
        const oldValue = getFieldValue(field)
        const newValue = tempValues[field]
        
        if (oldValue !== newValue) {
            await onTicketUpdate(field, newValue, oldValue)
            // Los eventos se emiten desde useTickets.updateTicket(), no necesitamos duplicarlos aquí
        }
        
        setEditingField(null)
        setTempValues({})
    }

    const handleCancel = () => {
        setEditingField(null)
        setTempValues({})
        setCalendarOpen(false)
    }

    const getFieldValue = (field: string) => {
        switch (field) {
            case 'status': return ticket?.status
            case 'priority': return ticket?.priority
            case 'technician_id': 
                // Priorizar technician_id si existe, sino usar technician.id
                return ticket?.technician_id || ticket?.technician?.id || null
            case 'type_id': return ticket?.type_id
            case 'due_date': return ticket?.due_date
            default: return ''
        }
    }

    const getDisplayValue = (field: string, value: any) => {
        switch (field) {
            case 'technician_id':
                // Si value es un ID (número), buscar en la lista de users
                if (typeof value === 'number' && value !== 0) {
                    const technician = users.find(u => u.id === value)
                    return technician ? `${technician.name} ${technician.last_name}` : 'Sin asignar'
                }
                // Si viene directamente del ticket como objeto technician
                if (ticket?.technician && typeof ticket.technician === 'object') {
                    return `${ticket.technician.name} ${ticket.technician.last_name}`
                }
                return 'Sin asignar'
            case 'type_id':
                if (!value) return 'Sin tipo'
                const type = types.find(t => t.id === value)
                return type ? type.type_name : 'Sin tipo'
            case 'due_date':
                return value ? new Date(value).toLocaleDateString('es-ES') : 'Sin fecha límite'
            default:
                return value || `Sin ${field}`
        }
    }

    const renderEditInput = (field: string, currentValue: any) => {
        const tempValue = tempValues[field] !== undefined ? tempValues[field] : currentValue

        switch (field) {
            case 'status':
                return (
                    <Select value={tempValue || ''} onValueChange={(value) => setTempValues({ ...tempValues, [field]: value })}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Abierto">Abierto</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                        </SelectContent>
                    </Select>
                )

            case 'priority':
                return (
                    <Select value={tempValue || ''} onValueChange={(value) => setTempValues({ ...tempValues, [field]: value })}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Baja">Baja</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                    </Select>
                )

            case 'technician_id':
                const canBeTechnician = (user: any) => {
                    // El backend devuelve 'rol_name' no 'role_name'
                    const roleName = user.role?.rol_name || user.role?.role_name
                    if (!roleName) return false
                    const roleNameLower = roleName.toLowerCase()
                    const canBe = roleNameLower.includes('técnico') || 
                           roleNameLower.includes('tecnico') || 
                           roleNameLower.includes('administrador') ||
                           roleNameLower.includes('admin')
                    console.log(`User ${user.name} (${roleName}) can be technician:`, canBe)
                    return canBe
                }

                const availableUsers = users.filter(canBeTechnician)
                console.log('Available users for technician select:', availableUsers)
                
                return (
                    <Select 
                        value={tempValue?.toString() || (ticket?.technician?.id ? ticket.technician.id.toString() : (ticket?.technician_id ? ticket.technician_id.toString() : '0'))} 
                        onValueChange={(value) => setTempValues({ ...tempValues, [field]: value === '0' ? null : parseInt(value) })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccionar técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Sin asignar</SelectItem>
                            {availableUsers.length > 0 ? (
                                availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} {user.last_name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-users" disabled>No hay usuarios disponibles</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                )

            case 'type_id':
                return (
                    <Select 
                        value={tempValue?.toString() || ''} 
                        onValueChange={(value) => setTempValues({ ...tempValues, [field]: parseInt(value) })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.type_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case 'due_date':
                return (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-8 text-xs justify-start text-left font-normal",
                                    !tempValue && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {tempValue ? format(new Date(tempValue), "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={tempValue ? new Date(tempValue) : undefined}
                                onSelect={(date: Date | undefined) => {
                                    if (date) {
                                        setTempValues({ ...tempValues, [field]: date.toISOString().split('T')[0] })
                                        setCalendarOpen(false)
                                    }
                                }}
                                disabled={(date: Date) => date < new Date()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )

            default:
                return null
        }
    }

    const renderField = (field: string, label: string, currentValue: any) => {
        const isEditing = editingField === field
        
        return (
            <div key={field} className="flex flex-col space-y-2">
                <span className="font-medium text-sm">{label}:</span>
                
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <div className="flex-1">
                            {renderEditInput(field, currentValue)}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleSave(field)} className="h-6 w-6 p-0">
                            <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0">
                            <XIcon className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex-1 break-words">{getDisplayValue(field, currentValue)}</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(field, currentValue)}
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0 ml-2"
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="border rounded-lg flex flex-col h-full">
            <div className="p-3 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-700 flex items-center">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Información a Editar
                </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-4 text-sm">
                    {renderField('status', 'Estado', ticket?.status)}
                    {renderField('priority', 'Prioridad', ticket?.priority)}
                    {renderField('technician_id', 'Asignado a', getFieldValue('technician_id'))}
                    {renderField('type_id', 'Tipo', ticket?.type_id)}
                    {renderField('due_date', 'Fecha límite', ticket?.due_date)}
                    
                    <div className="flex flex-col space-y-1">
                        <span className="font-medium">Creador:</span>
                        <span className="text-sm text-gray-600">
                            {ticket?.end_user 
                                ? `${ticket.end_user}`
                                : "Sin creador"
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}