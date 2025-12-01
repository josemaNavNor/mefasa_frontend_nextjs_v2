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
import { Rol } from "@/types/rol"


interface ColumnsProps {
    onEdit?: (rol: Rol) => void;
    onDelete?: (rol: Rol) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps = {}): ColumnDef<Rol>[] => [
    {
        accessorKey: "role_name",
        size: 180,
        minSize: 150,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("role_name")}</div>
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
                    Descripcion
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
                    Created At
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
                    Updated At
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
                    Deleted At
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
            const rol = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(rol.id)}
                        >
                            Copy role ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onEdit && (
                            <DropdownMenuItem
                                onClick={() => onEdit(rol)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit role
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(rol)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete role
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