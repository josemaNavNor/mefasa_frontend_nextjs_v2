"use client";
import { useType } from "@/hooks/use_typeTickets";
import { createColumns } from "./columns"
import Notiflix from 'notiflix';
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useMemo } from "react";
import { ticketTypeSchema } from "@/lib/zod";
import { useEventListener } from "@/hooks/useEventListener";
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

export default function TypeTicketsPage() {
    const { types, createTicketType, updateTicketType, deleteTicketType, refetch } = useType();
    const [description, setDescription] = useState("");
    const [type_name, setTicketTypeName] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estados para editar tipo de ticket
    const [editingType, setEditingType] = useState<any>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Escuchar eventos de cambios en tipos de tickets
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'types' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('types-updated', refetch);

    // Función para manejar la edición
    const handleEdit = useCallback((ticketType: any) => {
        setEditingType(ticketType);
        setEditTypeName(ticketType.type_name);
        setEditDescription(ticketType.description);
        setEditErrors({});
        setIsEditSheetOpen(true);
    }, []);

    // Función para manejar la eliminación
    const handleDelete = useCallback((ticketType: any) => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar el tipo de ticket "${ticketType.type_name}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await deleteTicketType(ticketType.id);
            },
            () => {
                // Cancelado, no hacer nada
            },
            {
                width: '320px',
                borderRadius: '8px',
                titleColor: '#f43f5e',
                okButtonBackground: '#f43f5e',
            }
        );
    }, [deleteTicketType]);

    // Crear las columnas con las funciones handleEdit y handleDelete usando useMemo
    const columns = useMemo(() => createColumns({ 
        onEdit: handleEdit, 
        onDelete: handleDelete 
    }), [handleEdit, handleDelete]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = ticketTypeSchema.safeParse({ type_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                type_name: formatted.type_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        
        await createTicketType({
            type_name,
            description,
        });
        
        // Limpiar formulario solo si fue exitoso
        setTicketTypeName("");
        setDescription("");
        setErrors({});
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditErrors({});
        
        const result = ticketTypeSchema.safeParse({ type_name: editTypeName, description: editDescription });

        if (!result.success) {
            const formatted = result.error.format();
            setEditErrors({
                type_name: formatted.type_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }

        await updateTicketType(editingType.id, {
            type_name: editTypeName,
            description: editDescription,
        });

        // Limpiar formulario y cerrar modal
        setEditingType(null);
        setEditTypeName("");
        setEditDescription("");
        setEditErrors({});
        setIsEditSheetOpen(false);
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestión Tipos de Tickets</h1>
            </div>
            <Sheet>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Tipo de Ticket</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Tipo de Ticket</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar un nuevo tipo de ticket.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="type_name">Tipo de Ticket</Label>
                            <Input
                                id="type_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del tipo de ticket"
                                value={type_name}
                                onChange={(e) => setTicketTypeName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.type_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.type_name && <p className="text-red-500 text-xs mt-1">{errors.type_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del tipo de ticket"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Tipo de Ticket</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Sheet para editar tipo de ticket */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Tipo de Ticket</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el tipo de ticket.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_type_name">Tipo de Ticket</Label>
                            <Input
                                id="edit_type_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del tipo de ticket"
                                value={editTypeName}
                                onChange={(e) => setEditTypeName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.type_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.type_name && <p className="text-red-500 text-xs mt-1">{editErrors.type_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del tipo de ticket"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.description && <p className="text-red-500 text-xs mt-1">{editErrors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Actualizar Tipo de Ticket</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <DataTable columns={columns} data={types} />
        </div>
    );
}