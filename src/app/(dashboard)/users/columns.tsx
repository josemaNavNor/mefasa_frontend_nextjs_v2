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
import { User } from "@/types/users"

interface ColumnsProps {
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps = {}): ColumnDef<User>[] => [
    {
        accessorKey: "name",
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
            <div className="text-left">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "last_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Apellido
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("last_name")}</div>
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Rol
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const role = row.getValue("role") as { rol_name?: string };
            return <div className="text-left">{role?.rol_name ?? "Sin rol"}</div>;
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Correo electronico
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("email")}</div>
        ),
    },
    {
        accessorKey: "phone_number",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Numero de Telefono
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("phone_number") ? row.getValue("phone_number") : "N/A"}</div>
        ),
    },
    {
        accessorKey: "is_email_verified",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email verificado
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("is_email_verified") ? "Si" : "No"}</div>
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
                    Created At
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("created_at")}</div>
        ),
    },
    {
        accessorKey: "updated_at",
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
        cell: ({ row }) => (
            <div className="text-left">{row.getValue("updated_at")}</div>
        ),
    },
    {
        accessorKey: "deleted_at",
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
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("deleted_at") ? row.getValue("deleted_at") : "Activo"}</div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
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
                            onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                            Copy user ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onEdit && (
                            <DropdownMenuItem
                                onClick={() => onEdit(user)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit user
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(user)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete user
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