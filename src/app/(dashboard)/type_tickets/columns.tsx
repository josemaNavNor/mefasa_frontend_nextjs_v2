"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown } from "lucide-react"
import { TicketType } from "@/types/ticketType"

interface ColumnsProps {
    onEdit?: (ticketType: TicketType) => void;
    onDelete?: (ticketType: TicketType) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps = {}): ColumnDef<TicketType>[] => [
    {
        accessorKey: "type_name",
        size: 180,
        minSize: 150,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre del Tipo
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("type_name")}</div>
        ),
    },
    {
        accessorKey: "description",
        size: 300,
        minSize: 200,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Descripción
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const description = row.getValue("description") as string;
            return (
                <div className="text-left truncate max-w-[280px]" title={description || undefined}>
                    {description || "Sin descripción"}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        size: 180,
        minSize: 160,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Creado el
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("created_at") as string;
            const formattedDate = date ? new Date(date).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '';
            return (
                <div className="text-left text-sm" title={date}>
                    {formattedDate}
                </div>
            );
        },
    },
    {
        accessorKey: "updated_at",
        size: 180,
        minSize: 160,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Actualizado el
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("updated_at") as string;
            const formattedDate = date ? new Date(date).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '';
            return (
                <div className="text-left text-sm" title={date}>
                    {formattedDate}
                </div>
            );
        },
    },
    {
        accessorKey: "deleted_at",
        size: 140,
        minSize: 120,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Estado
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const deletedAt = row.getValue("deleted_at") as string;
            if (deletedAt) {
                const formattedDate = new Date(deletedAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return (
                    <div className="text-center text-sm" title={deletedAt}>
                        {formattedDate}
                    </div>
                );
            }
            return <div className="text-center">Activo</div>;
        },
    },
    {
        id: "actions",
        size: 80,
        minSize: 70,
        cell: ({ row }) => {
            const ticketType = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(ticketType.id)}
                        >
                            Copiar ID del tipo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onEdit && (
                            <DropdownMenuItem
                                onClick={() => onEdit(ticketType)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar tipo
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(ticketType)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar tipo
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

// Mantener compatibilidad con la exportación anterior
export const columns = createColumns();