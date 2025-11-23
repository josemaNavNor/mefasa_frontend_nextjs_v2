"use client";

// React imports
import { useState, useCallback, useMemo, useEffect } from "react";

// Next.js imports
import { Download, ChevronLeft, ChevronRight, Filter as FilterIcon } from "lucide-react";

// Component imports
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { EditTicketDialog } from "@/components/edit-ticket-dialog";
import { TicketDetailsModal } from "@/components/ticket-details-modal";
import { FavoriteFilters } from "@/components/filter";
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

// Hook imports
import { useTicketsContext } from "@/contexts/TicketsContext";
import { useTypesContext } from "@/contexts/TypesContext";
import { useFloorsContext } from "@/contexts/FloorsContext";
import { useUsersMinimalContext } from "@/contexts/UsersMinimalContext";
import { useEventListener } from "@/hooks/useEventListener";
import { useSettings } from "@/contexts/SettingsContext";

// Utility imports
import { createColumns } from "./columns"
import { createTicketHandlers } from "./handlers";
import { TICKET_EVENTS } from "@/lib/events";
import { logger } from "@/lib/logger";

// Type imports
import type { Ticket } from "@/types";
import { Filter } from "@/types/filter";

export default function TicketsPage() {
    const { tickets, createTicket, deleteTicket, refetch, exportToExcel, isPolling } = useTicketsContext();
    const { types } = useTypesContext();
    const { users } = useUsersMinimalContext();
    const { floors } = useFloorsContext();
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
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Estado para el modal de detalles
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Estado para controlar el Sheet de creación
    const [sheetOpen, setSheetOpen] = useState(false);

    // Estado para filtros
    const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
    
    // Función para aplicar filtros - movida antes de useMemo
    const applyFilterLogic = useCallback((filter: Filter | null, ticketsToFilter: Ticket[]): Ticket[] => {
        if (!filter || !filter.filterCriteria || filter.filterCriteria.length === 0) {
            return ticketsToFilter;
        }

        return ticketsToFilter.filter(ticket => {
            let result = true;
            
            filter.filterCriteria!.forEach((criterion, index) => {
                // Mapear nombres de campos del filtro a los nombres reales del ticket
                let fieldName = criterion.field_name;
                
                // Mapeo de campos comunes
                const fieldMapping: { [key: string]: string } = {
                    'title': 'summary',
                    'description': 'description',
                    'status': 'status',
                    'priority': 'priority',
                    'type_id': 'type_id',
                    'floor_id': 'floor_id',
                    'technician_id': 'technician_id',
                    'created_at': 'created_at',
                    'updated_at': 'updated_at'
                };
                
                const mappedField = fieldMapping[fieldName];
                if (mappedField) {
                    fieldName = mappedField;
                }
                
                const fieldValue = ticket[fieldName as keyof typeof ticket];
                const criterionValue = criterion.value;
                
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
            });
            
            return result;
        });
    }, []);
    
    // Derivar filteredTickets usando useMemo
    const filteredTickets = useMemo(() => {
        return applyFilterLogic(activeFilter, tickets);
    }, [activeFilter, tickets, applyFilterLogic]);

    // Crear handlers
    const handlers = createTicketHandlers({
        createTicket,
        deleteTicket: (id: string | number) => deleteTicket(id).then(() => true).catch(() => false),
        exportToExcel
    });

    // Wrapper functions para los handlers
    const handleDelete = useCallback((ticket: Ticket) => {
        handlers.handleDelete(ticket);
    }, [handlers]);

    const handleEditTicket = useCallback((ticket: Ticket) => {
        handlers.handleEditTicket(ticket, setEditingTicket, setShowEditDialog);
    }, [handlers]);

    const handleRowClick = useCallback((ticket: Ticket) => {
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

    const handleDataChange = useCallback(() => {
        // Solo refrescar cuando hay cambios específicos de tickets
        refetch();
    }, [refetch]);

    // Escuchar solo eventos específicos de tickets
    useEventListener(TICKET_EVENTS.REFRESH_TICKETS_PAGE, handleDataChange);
    useEventListener(TICKET_EVENTS.UPDATED, handleDataChange);
    useEventListener(TICKET_EVENTS.CREATED, handleDataChange);
    useEventListener(TICKET_EVENTS.DELETED, handleDataChange);

    // Función para aplicar filtros - ahora solo establece el filtro activo
    // El filtrado real se hace automáticamente con useMemo
    const applyFilter = useCallback((filter: Filter) => {
        setActiveFilter(filter);
    }, []);

    const clearFilter = useCallback(() => {
        setActiveFilter(null);
    }, []);

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
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                        className="lg:flex hidden items-center gap-2"
                    >
                        {isFiltersCollapsed ? (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <FilterIcon className="h-4 w-4" />
                                Mostrar Filtros
                            </>
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4" />
                                Ocultar Filtros
                            </>
                        )}
                    </Button>
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
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Panel de filtros favoritos */}
                {!isFiltersCollapsed && (
                    <div className="lg:flex-shrink-0 w-full lg:w-auto">
                        <FavoriteFilters
                            onApplyFilter={applyFilter}
                            activeFilter={activeFilter}
                            onClearFilter={clearFilter}
                        />
                    </div>
                )}

                {/* Tabla de tickets */}
                <div className={`flex-1 min-w-0 ${isFiltersCollapsed ? 'lg:ml-0' : ''}`}>
                    {/* Mostrar información del filtro activo cuando los filtros están ocultos */}
                    {isFiltersCollapsed && activeFilter && (
                        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FilterIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Filtro activo: {activeFilter.filter_name}</span>
                                    {activeFilter.filterCriteria && (
                                        <span className="text-xs text-muted-foreground">
                                            ({activeFilter.filterCriteria.length} criterio{activeFilter.filterCriteria.length !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilter}
                                    className="text-xs"
                                >
                                    Limpiar filtro
                                </Button>
                            </div>
                        </div>
                    )}
                    
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