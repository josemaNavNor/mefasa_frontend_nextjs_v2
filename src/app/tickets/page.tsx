"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react";
import { useTickets } from "@/hooks/use_tickets";
import { useType } from "@/hooks/use_typeTickets";
import { useEventListener } from "@/hooks/useEventListener";
import { EditTicketDialog } from "@/components/edit-ticket-dialog";
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
    const { refetch, exportToExcel } = useTickets();
    const { tickets } = useTickets();
    const { types } = useType();
    const { users } = useUsers(); // Para obtener usuarios y técnicos
    const { createTicket } = useTickets();

    const [ticket_number, setTicketNumber] = useState("");
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [end_user_id, setEndUserId] = useState("");
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

    // Crear columnas con callback de edición
    const columns = createColumns({
        onEditTicket: (ticket) => {
            setEditingTicket(ticket);
            setShowEditDialog(true);
        }
    });

    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'roles' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('roles-updated', refetch);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        await createTicket({
            ticket_number,
            summary,
            description,
            end_user_id: Number(end_user_id),
            technician_id: Number(technician_id),
            type_id: Number(type_id),
            floor_id: Number(floor_id),
            area_id: Number(area_id),
            priority,
            status,
            due_date
        });

        // Reset form
        setSummary("");
        setDescription("");
        setEndUserId("");
        setTechnicianId("");
        setTypeId("");
        setFloorId("");
        setAreaId("");
        setPriority("");
        setStatus("");
        setDueDate("");
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Tickets</h1>
            </div>
            <div className="flex gap-2 mb-4">
                <Sheet>
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
                            <Label htmlFor="end_user_id">Usuario final</Label>
                            <Select value={end_user_id} onValueChange={setEndUserId} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un usuario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} {user.last_name}
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
                onClick={() => exportToExcel()}
                className="ml-2"
            >
                <Download className="h-4 w-4 mr-2" />
                Exportar a Excel
            </Button>
            </div>
            <DataTable columns={columns} data={tickets} />
            
            {/* Diálogo de Edición */}
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
        </div>
    );
}