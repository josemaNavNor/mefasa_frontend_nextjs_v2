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
import { Edit2, Check, X as XIcon } from "lucide-react"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { Ticket, User, TicketType, Floor } from "@/types/ticket"

interface TicketBasicInfoProps {
    ticket: Ticket
    users: User[]
    types: TicketType[]
    floors: Floor[]
    onTicketUpdate: (field: string, newValue: any, oldValue: any) => void
}

export function TicketBasicInfo({ ticket, users, types, floors, onTicketUpdate }: TicketBasicInfoProps) {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValues, setTempValues] = useState<{ [key: string]: any }>({})
    const [calendarOpen, setCalendarOpen] = useState(false)

    const handleEdit = (field: string, currentValue: any) => {
        setEditingField(field)
        setTempValues({ ...tempValues, [field]: currentValue })
    }

    // Guardar el cambio y llamar al callback
    const handleSave = async (field: string) => {
        const oldValue = getFieldValue(field)
        const newValue = tempValues[field]

        if (oldValue !== newValue) {
            await onTicketUpdate(field, newValue, oldValue)
        }

        setEditingField(null)
        setTempValues({})
    }

    // Cancelar la edición
    const handleCancel = () => {
        setEditingField(null)
        setTempValues({})
        setCalendarOpen(false)
    }

    // Obtener el valor actual del ticket para un campo dado
    const getFieldValue = (field: string) => {
        switch (field) {
            case 'status': return ticket?.status
            case 'priority': return ticket?.priority
            case 'technician_id':
                return ticket?.technician_id || ticket?.technician?.id || null
            case 'type_id': return ticket?.type_id
            case 'floor_id': return ticket?.floor_id
            case 'due_date': return ticket?.due_date
            default: return ''
        }
    }

    // Obtener el valor a mostrar en funcion del campo 
    const getDisplayValue = (field: string, value: any) => {
        switch (field) {
            case 'technician_id':
                // Si value es un numer busca en la lista de users
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
            case 'floor_id':
                // Si value es un numero, busca en la lista de floors
                if (typeof value === 'number' && value !== 0) {
                    const floor = floors.find(f => f.id === value)
                    return floor ? floor.floor_name : 'Sin planta'
                }
                // Si viene directamente del ticket como objeto floor
                if (ticket?.floor && typeof ticket.floor === 'object') {
                    return ticket.floor.floor_name
                }
                return 'Sin planta'
            case 'due_date':
                return value ? new Date(value).toLocaleDateString('es-ES') : 'Sin fecha límite'
            default:
                return value || `Sin ${field}`
        }
    }

    // Renderizar el input de edicion segun el campo
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
                    const roleName = user.role?.rol_name || user.role?.role_name
                    if (!roleName) return false
                    const roleNameLower = roleName.toLowerCase()
                    const canBe = roleNameLower.includes('técnico') ||
                        roleNameLower.includes('tecnico') ||
                        roleNameLower.includes('administrador') ||
                        roleNameLower.includes('admin')
                    //console.log(`Usuario ${user.name} (${roleName}) puede ser tecnico:`, canBe)
                    return canBe
                }

                const availableUsers = users.filter(canBeTechnician)
                //console.log('Usuario disponible para tecnico:', availableUsers)

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

            case 'floor_id':
                return (
                    <Select
                        value={tempValue?.toString() || '0'}
                        onValueChange={(value) => setTempValues({ ...tempValues, [field]: value === '0' ? null : parseInt(value) })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccionar planta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Sin planta</SelectItem>
                            {floors.map((floor) => (
                                <SelectItem key={floor.id} value={floor.id.toString()}>
                                    {floor.floor_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case 'due_date':
                const todayDate = new Date().toISOString().split('T')[0] as string;
                return (
                    <SimpleDatePicker
                        value={tempValue || ''}
                        onChange={(date: string) => {
                            setTempValues({ ...tempValues, [field]: date })
                        }}
                        minDate={todayDate}
                    />
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
                    {renderField('floor_id', 'Planta', ticket?.floor_id)}
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