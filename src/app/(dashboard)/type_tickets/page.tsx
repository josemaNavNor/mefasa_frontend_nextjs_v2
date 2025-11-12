"use client";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo, useState, useCallback } from "react";
import { useTypeTicketManagement } from "@/hooks/useTypeTicketManagement";
import { useEventListener } from "@/hooks/useEventListener";
import { TYPE_EVENTS } from "@/lib/events";
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
    const { 
        types, 
        createTypeForm, 
        editTypeForm, 
        handleEdit, 
        handleDelete 
    } = useTypeTicketManagement();

    // Estado para controlar el Sheet de creación
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

    // Cerrar formulario cuando se cree exitosamente
    const handleCloseCreateSheet = useCallback(() => {
        setIsCreateSheetOpen(false);
    }, []);

    // Escuchar evento de cerrar formulario
    useEventListener(TYPE_EVENTS.CLOSE_FORM, handleCloseCreateSheet);

    // Crear las columnas con las funciones handleEdit y handleDelete usando useMemo
    const columns = useMemo(() => createColumns({ 
        onEdit: handleEdit, 
        onDelete: handleDelete 
    }), [handleEdit, handleDelete]);

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestión Tipos de Tickets</h1>
            </div>
            <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
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
                    <form onSubmit={createTypeForm.handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="type_name">Tipo de Ticket</Label>
                            <Input
                                id="type_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del tipo de ticket"
                                value={createTypeForm.type_name}
                                onChange={(e) => createTypeForm.setTicketTypeName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createTypeForm.errors.type_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createTypeForm.errors.type_name && <p className="text-red-500 text-xs mt-1">{createTypeForm.errors.type_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del tipo de ticket"
                                value={createTypeForm.description}
                                onChange={(e) => createTypeForm.setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createTypeForm.errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createTypeForm.errors.description && <p className="text-red-500 text-xs mt-1">{createTypeForm.errors.description}</p>}
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
            <Sheet open={editTypeForm.isEditSheetOpen} onOpenChange={editTypeForm.setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Tipo de Ticket</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el tipo de ticket.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={editTypeForm.handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_type_name">Tipo de Ticket</Label>
                            <Input
                                id="edit_type_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del tipo de ticket"
                                value={editTypeForm.editTypeName}
                                onChange={(e) => editTypeForm.setEditTypeName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editTypeForm.editErrors.type_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editTypeForm.editErrors.type_name && <p className="text-red-500 text-xs mt-1">{editTypeForm.editErrors.type_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del tipo de ticket"
                                value={editTypeForm.editDescription}
                                onChange={(e) => editTypeForm.setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editTypeForm.editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editTypeForm.editErrors.description && <p className="text-red-500 text-xs mt-1">{editTypeForm.editErrors.description}</p>}
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