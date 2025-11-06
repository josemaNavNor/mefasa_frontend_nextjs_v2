"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Sparkles } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown } from "lucide-react"
import { TicketPage as Ticket } from "@/types/ticket"

interface ColumnsProps {
    onEditTicket?: (ticket: Ticket) => void;
    onDeleteTicket?: (ticket: Ticket) => void;
}

export const createColumns = ({ onDeleteTicket }: ColumnsProps = {}): ColumnDef<Ticket>[] => [
    {
        accessorKey: "ticket_number",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Número de Ticket
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const ticket = row.original as any;
            return (
                <div className="text-center flex items-center justify-center gap-2">
                    <span>{row.getValue("ticket_number")}</span>
                    {ticket.isNew && (
                        <div title="Ticket nuevo - No visto">
                            <p className="h-4 w-4 text-blue-500 animate-pulse">¡Nuevo!</p>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "summary",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Título
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("summary")}</div>
        ),
    },
    {
        accessorKey: "end_user",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Creador
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("end_user") ? row.getValue("end_user") : "Creado desde el portal"}</div>
        ),
    },
    {
        accessorKey: "technician",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Asignado a
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const technician = row.getValue("technician") as { name?: string, last_name?: string };
            return <div className="text-center">{technician ? `${technician.name} ${technician.last_name}` : "Sin Asignar"}</div>;
        },
    },
    {
        accessorKey: "floor",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Planta
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const floor = row.getValue("floor") as { floor_name?: string };
            return <div className="text-center">{floor ? `${floor.floor_name}` : "Sin Asignar"}</div>;
        },
    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tipo de Ticket
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.getValue("type") as { type_name?: string };
            return <div className="text-center">{type?.type_name ?? "Sin Asignar"}</div>;
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Prioridad
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("priority") ? row.getValue("priority") : "Sin Prioridad"}</div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("status") ? row.getValue("status") : "Sin Estado"}</div>
        ),
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fecha Límite
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("due_date") ? row.getValue("due_date") : "Sin fecha"}</div>
        ),
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fecha y Hora de Creación
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dateValue = row.getValue("created_at") as string;
            const formatDate = (dateString: string) => {
                if (!dateString) return "Sin fecha";
                try {
                    const date = new Date(dateString);
                    return date.toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch (error) {
                    return dateString;
                }
            };
            return (
                <div className="text-left">{formatDate(dateValue)}</div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(user.ticket_number);
                            }}
                        >
                            Copiar Numero de ticket
                        </DropdownMenuItem>
                        {onDeleteTicket && (
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTicket(user);
                                }}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar ticket
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

// Exportación por defecto para compatibilidad hacia atrás
export const columns = createColumns();