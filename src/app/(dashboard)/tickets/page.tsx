"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { createColumns } from "./columns"
import { createTicketHandlers } from "./handlers";
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useMemo } from "react";
import { useTickets } from "@/hooks/use_tickets";
import { useType } from "@/hooks/use_typeTickets";
import { useFloors } from "@/hooks/use_floors";
import { useEventListener } from "@/hooks/useEventListener";
import { useSettings } from "@/contexts/SettingsContext";
import { EditTicketDialog } from "@/components/edit-ticket-dialog";
import { TicketDetailsModal } from "@/components/ticket-details-modal";
import { FavoriteFilters } from "@/components/filter";
import { Download } from "lucide-react";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { Filter } from "@/types/filter";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function TicketsPage() {
    const { tickets, createTicket, deleteTicket, refetch, exportToExcel, isPolling } = useTickets();
    const { types } = useType();
    const { users } = useUsers();
    const { floors } = useFloors();
    const { autoRefreshEnabled } = useSettings();

    const [ticket_number] = useState("");
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [end_user, setEndUser] = useState("");
    const [technician_id, setTechnicianId] = useState("0");
    const [type_id, setTypeId] = useState("");
    const [floor_id, setFloorId] = useState("0");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");
    const [due_date, setDueDate] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Estado para edición de tickets
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Estado para el modal de detalles
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Estado para controlar el Sheet de creación
    const [sheetOpen, setSheetOpen] = useState(false);

    // Estado para filtros
    const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
    const [filteredTickets, setFilteredTickets] = useState(tickets);

    // Crear handlers
    const handlers = createTicketHandlers({
        createTicket,
        deleteTicket,
        exportToExcel
    });

    // Wrapper functions para los handlers
    const handleDelete = useCallback((ticket: any) => {
        handlers.handleDelete(ticket);
    }, [handlers]);

    const handleEditTicket = useCallback((ticket: any) => {
        handlers.handleEditTicket(ticket, setEditingTicket, setShowEditDialog);
    }, [handlers]);

    const handleRowClick = useCallback((ticket: any) => {
        handlers.handleRowClick(ticket, setSelectedTicket, setShowDetailsModal);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        const formData = {
            ticket_number, summary, description, end_user,
            technician_id, type_id, floor_id, priority,
            status, due_date
        };

        const setters = {
            setSummary, setDescription, setEndUser, setTechnicianId,
            setTypeId, setFloorId,setPriority, setStatus, setDueDate,
            setErrors
        };

        await handlers.handleSubmit(e, formData, setters, () => {
            setSheetOpen(false); // Cerrar el sheet cuando se crea exitosamente
        });
    }, [handlers, ticket_number, summary, description, end_user, technician_id, type_id, floor_id, priority, status, due_date]);

    const handleExportToExcel = useCallback(() => {
        handlers.handleExportToExcel();
    }, [handlers]);

    // Crear columnas con callbacks de edición y eliminación usando useMemo
    const columns = useMemo(() => createColumns({
        onEditTicket: handleEditTicket,
        onDeleteTicket: handleDelete
    }), [handleEditTicket, handleDelete]);

    const handleDataChange = useCallback((dataType: string) => {
        handlers.handleDataChange(dataType, refetch);
    }, [handlers, refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('roles-updated', refetch);

    // Función para aplicar filtros
    const applyFilter = useCallback((filter: Filter) => {
        console.log('Aplicando filtro:', filter);
        setActiveFilter(filter);
        
        if (!filter.filterCriteria || filter.filterCriteria.length === 0) {
            console.log('Filtro sin criterios, mostrando todos los tickets');
            setFilteredTickets(tickets);
            return;
        }

        console.log('Filtros a aplicar:', filter.filterCriteria);
        console.log('Tickets originales:', tickets.length);

        const filtered = tickets.filter(ticket => {
            let result = true;
            
            filter.filterCriteria!.forEach((criterion, index) => {
                const fieldValue = ticket[criterion.field_name as keyof typeof ticket];
                const criterionValue = criterion.value;
                
                console.log(`Criterio ${index + 1}:`, {
                    field: criterion.field_name,
                    operator: criterion.operator,
                    value: criterionValue,
                    fieldValue,
                    logicalOperator: criterion.logical_operator
                });
                
                let matches = false;
                
                switch (criterion.operator) {
                    case 'equals':
                        matches = String(fieldValue).toLowerCase() === criterionValue.toLowerCase();
                        break;
                    case 'not_equals':
                        matches = String(fieldValue).toLowerCase() !== criterionValue.toLowerCase();
                        break;
                    case 'contains':
                        matches = String(fieldValue).toLowerCase().includes(criterionValue.toLowerCase());
                        break;
                    case 'not_contains':
                        matches = !String(fieldValue).toLowerCase().includes(criterionValue.toLowerCase());
                        break;
                    case 'starts_with':
                        matches = String(fieldValue).toLowerCase().startsWith(criterionValue.toLowerCase());
                        break;
                    case 'ends_with':
                        matches = String(fieldValue).toLowerCase().endsWith(criterionValue.toLowerCase());
                        break;
                    case 'greater_than':
                        matches = Number(fieldValue) > Number(criterionValue);
                        break;
                    case 'less_than':
                        matches = Number(fieldValue) < Number(criterionValue);
                        break;
                    case 'greater_equal':
                        matches = Number(fieldValue) >= Number(criterionValue);
                        break;
                    case 'less_equal':
                        matches = Number(fieldValue) <= Number(criterionValue);
                        break;
                    case 'is_null':
                        matches = fieldValue === null || fieldValue === undefined || fieldValue === '';
                        break;
                    case 'is_not_null':
                        matches = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
                        break;
                    default:
                        matches = false;
                }

                console.log(`Criterio ${index + 1} matches:`, matches);

                // Para el primer criterio, establecer el resultado inicial
                if (index === 0) {
                    result = matches;
                } else {
                    // Para criterios subsiguientes, aplicar el operador lógico
                    if (criterion.logical_operator === 'AND') {
                        result = result && matches;
                    } else if (criterion.logical_operator === 'OR') {
                        result = result || matches;
                    }
                }
                
                console.log(`Resultado acumulado:`, result);
            });
            
            return result;
        });
        
        console.log('Tickets filtrados:', filtered.length);
        setFilteredTickets(filtered);
    }, [tickets]);

    const clearFilter = useCallback(() => {
        setActiveFilter(null);
        setFilteredTickets(tickets);
    }, [tickets]);

    // Actualizar tickets filtrados cuando cambien los tickets originales
    useMemo(() => {
        if (activeFilter) {
            applyFilter(activeFilter);
        } else {
            setFilteredTickets(tickets);
        }
    }, [tickets, activeFilter, applyFilter]);

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold">Tickets</h1>
                    {autoRefreshEnabled && isPolling && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Auto-refresh activo
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex gap-2 mb-4">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline">Agregar Ticket</Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Agregar Ticket</SheetTitle>
                            <SheetDescription>
                                Completa los campos a continuación para agregar un nuevo ticket.
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-4 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="summary">Título</Label>
                                <Input
                                    id="summary"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Título del ticket"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Descripción del ticket"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="type_id">Tipo de ticket</Label>
                                <Select value={type_id} onValueChange={setTypeId} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un tipo de ticket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                {type.type_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="technician_id">Asignar técnico</Label>
                                <Select value={technician_id} onValueChange={setTechnicianId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un técnico (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Sin asignar</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name} {user.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="floor_id">Planta</Label>
                                <Select value={floor_id} onValueChange={setFloorId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una planta (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Sin asignar</SelectItem>
                                        {floors.map((floor) => (
                                            <SelectItem key={floor.id} value={String(floor.id)}>
                                                {floor.floor_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="priority">Prioridad</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Baja">Baja</SelectItem>
                                        <SelectItem value="Media">Media</SelectItem>
                                        <SelectItem value="Alta">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="status">Estado</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Abierto">Abierto</SelectItem>
                                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="due_date">Fecha límite</Label>
                                <SimpleDatePicker
                                    value={due_date || ''}
                                    onChange={(date: string) => {
                                        setDueDate(date);
                                    }}
                                    minDate={new Date().toISOString().split('T')[0]}
                                />

                            </div>

                            <SheetFooter>
                                <Button type="submit">Agregar Ticket</Button>
                                <SheetClose asChild>
                                    <Button variant="outline">Cerrar</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
                <Button
                    variant="default"
                    onClick={handleExportToExcel}
                    className="ml-2"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar a Excel
                </Button>
            </div>

            {/* Layout principal con filtros favoritos a la izquierda */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Panel de filtros favoritos */}
                <div className="lg:flex-shrink-0 w-full lg:w-auto">
                    <FavoriteFilters
                        onApplyFilter={applyFilter}
                        activeFilter={activeFilter}
                        onClearFilter={clearFilter}
                    />
                </div>

                {/* Tabla de tickets */}
                <div className="flex-1 min-w-0">
                    <DataTable
                        columns={columns}
                        data={filteredTickets}
                        onRowClick={handleRowClick}
                        showFilters={true}
                    />
                </div>
            </div>

            {/* Dialogo de edicion */}
            <EditTicketDialog
                ticket={editingTicket}
                open={showEditDialog}
                onOpenChange={(open) => {
                    setShowEditDialog(open);
                    if (!open) {
                        setEditingTicket(null);
                    }
                }}
            />

            {/* Modal de detalles del ticket */}
            <TicketDetailsModal
                ticket={selectedTicket}
                open={showDetailsModal}
                onOpenChange={(open) => {
                    setShowDetailsModal(open);
                    if (!open) {
                        setSelectedTicket(null);
                    }
                }}
            />
        </div>
    );
}