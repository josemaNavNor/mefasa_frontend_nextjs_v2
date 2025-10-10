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
import { useEventListener } from "@/hooks/useEventListener";
import { useSettings } from "@/contexts/SettingsContext";
import { EditTicketDialog } from "@/components/edit-ticket-dialog";
import { TicketDetailsModal } from "@/components/ticket-details-modal";
import { Download } from "lucide-react";

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
    const { autoRefreshEnabled } = useSettings();

    const [ticket_number] = useState("");
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [end_user, setEndUser] = useState("");
    const [technician_id, setTechnicianId] = useState("");
    const [type_id, setTypeId] = useState("");
    const [floor_id, setFloorId] = useState(""); 
    const [area_id, setAreaId] = useState(""); 
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
            technician_id, type_id, floor_id, area_id, priority,
            status, due_date
        };

        const setters = {
            setSummary, setDescription, setEndUser, setTechnicianId,
            setTypeId, setFloorId, setAreaId, setPriority, setStatus, setDueDate,
            setErrors
        };

        await handlers.handleSubmit(e, formData, setters);
    }, [handlers, ticket_number, summary, description, end_user, technician_id, type_id, floor_id, area_id, priority, status, due_date]);

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
                <Sheet>
                    {/* <SheetTrigger asChild>
                        <Button variant="outline">Agregar Ticket</Button>
                    </SheetTrigger> */}
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
                                    <SelectValue placeholder="Selecciona un técnico" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.filter(user => user.role?.name === 'Tecnico' || user.role?.name === 'Administrador').map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} {user.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="floor_id">Planta</Label>
                            <Input
                                id="floor_id"
                                type="number"
                                placeholder="ID de la planta"
                                value={floor_id}
                                onChange={(e) => setFloorId(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="area_id">Área</Label>
                            <Input
                                id="area_id"
                                type="number"
                                placeholder="ID del área"
                                value={area_id}
                                onChange={(e) => setAreaId(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="due_date">Fecha límite</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={due_date}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full"
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
            
            <DataTable 
                columns={columns} 
                data={tickets} 
                onRowClick={handleRowClick}
                showFilters={true}
            />
            
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