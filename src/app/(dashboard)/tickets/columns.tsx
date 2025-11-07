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
                    className="h-8 px-2 py-1"
                >
                    #ID
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const ticket = row.original as any;
            return (
                <div className="text-center flex items-center justify-center gap-1">
                    <span className="font-mono text-sm">{row.getValue("ticket_number")}</span>
                    {ticket.isNew && (
                        <div title="Ticket nuevo - No visto">
                            <p className="h-3 w-3 text-blue-500 animate-pulse text-xs">●</p>
                        </div>
                    )}
                </div>
            );
        },
        size: 80,
        minSize: 80,
        maxSize: 100,
    },
    {
        accessorKey: "summary",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Título
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left text-sm max-w-[300px] truncate" title={row.getValue("summary") as string}>
                {row.getValue("summary")}
            </div>
        ),
        size: 300,
        minSize: 200,
        maxSize: 400,
    },
    {
        accessorKey: "end_user",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Creador
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left text-sm max-w-[150px] truncate" title={row.getValue("end_user") as string || "Creado desde el portal"}>
                {row.getValue("end_user") ? row.getValue("end_user") : "Portal"}
            </div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
    },
    {
        accessorKey: "technician",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Asignado
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const technician = row.getValue("technician") as { name?: string, last_name?: string };
            const fullName = technician ? `${technician.name} ${technician.last_name}` : "Sin Asignar";
            return (
                <div className="text-center text-sm max-w-[120px] truncate" title={fullName}>
                    {technician ? `${technician.name} ${technician.last_name}` : "Sin Asignar"}
                </div>
            );
        },
        size: 120,
        minSize: 100,
        maxSize: 150,
    },
    {
        accessorKey: "floor",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Planta
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const floor = row.getValue("floor") as { floor_name?: string };
            return (
                <div className="text-center text-sm">
                    {floor ? `${floor.floor_name}` : "N/A"}
                </div>
            );
        },
        size: 80,
        minSize: 60,
        maxSize: 100,
    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Tipo
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.getValue("type") as { type_name?: string };
            return (
                <div className="text-center text-sm max-w-[100px] truncate" title={type?.type_name ?? "Sin Asignar"}>
                    {type?.type_name ?? "N/A"}
                </div>
            );
        },
        size: 100,
        minSize: 80,
        maxSize: 120,
    },
    {
        accessorKey: "priority",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Prioridad
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string;
            const getPriorityColor = (priority: string) => {
                switch (priority?.toLowerCase()) {
                    case 'high':
                    case 'alta':
                        return 'text-red-600 bg-red-50';
                    case 'medium':
                    case 'media':
                        return 'text-yellow-600 bg-yellow-50';
                    case 'low':
                    case 'baja':
                        return 'text-green-600 bg-green-50';
                    default:
                        return 'text-gray-600 bg-gray-50';
                }
            };
            return (
                <div className="text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(priority)}`}>
                        {priority || "N/A"}
                    </span>
                </div>
            );
        },
        size: 90,
        minSize: 80,
        maxSize: 110,
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Estado
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getStatusColor = (status: string) => {
                switch (status?.toLowerCase()) {
                    case 'open':
                    case 'abierto':
                        return 'text-blue-600 bg-blue-50';
                    case 'in progress':
                    case 'en progreso':
                        return 'text-orange-600 bg-orange-50';
                    case 'closed':
                    case 'cerrado':
                        return 'text-green-600 bg-green-50';
                    case 'pending':
                    case 'pendiente':
                        return 'text-yellow-600 bg-yellow-50';
                    default:
                        return 'text-gray-600 bg-gray-50';
                }
            };
            return (
                <div className="text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                        {status || "N/A"}
                    </span>
                </div>
            );
        },
        size: 90,
        minSize: 80,
        maxSize: 110,
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Vencimiento
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dateValue = row.getValue("due_date") as string;
            const formatDate = (dateString: string) => {
                if (!dateString) return "N/A";
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    });
                } catch (error) {
                    return "N/A";
                }
            };
            return (
                <div className="text-center text-sm font-mono">
                    {formatDate(dateValue)}
                </div>
            );
        },
        size: 100,
        minSize: 90,
        maxSize: 120,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 py-1"
                >
                    Creado
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dateValue = row.getValue("created_at") as string;
            const formatDate = (dateString: string) => {
                if (!dateString) return "N/A";
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    });
                } catch (error) {
                    return "N/A";
                }
            };
            return (
                <div className="text-center text-sm font-mono">
                    {formatDate(dateValue)}
                </div>
            );
        },
        size: 90,
        minSize: 80,
        maxSize: 110,
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const user = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(user.ticket_number);
                            }}
                        >
                            Copiar #ID
                        </DropdownMenuItem>
                        {onDeleteTicket && (
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTicket(user);
                                }}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Eliminar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        size: 50,
        minSize: 40,
        maxSize: 60,
    },
]

// Exportación por defecto para compatibilidad hacia atrás
export const columns = createColumns();