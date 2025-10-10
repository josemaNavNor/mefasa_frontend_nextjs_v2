"use client";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo } from "react";
import { useFloorManagement } from "@/hooks/useFloorManagement";
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

export default function FloorsPage() {
    const { 
        floors, 
        createFloorForm, 
        editFloorForm, 
        handleEdit, 
        handleDelete 
    } = useFloorManagement();

    // Crear las columnas con las funciones handleEdit y handleDelete usando useMemo
    const columns = useMemo(() => createColumns({ 
        onEdit: handleEdit, 
        onDelete: handleDelete 
    }), [handleEdit, handleDelete]);

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestión de Plantas</h1>
            </div>
            <Sheet>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Planta</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Planta</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar una nueva planta.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={createFloorForm.handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="floor_name">Nombre</Label>
                            <Input
                                id="floor_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre de la planta"
                                value={createFloorForm.floor_name}
                                onChange={(e) => createFloorForm.setFloorName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createFloorForm.errors.floor_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createFloorForm.errors.floor_name && <p className="text-red-500 text-xs mt-1">{createFloorForm.errors.floor_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción de la planta"
                                value={createFloorForm.description}
                                onChange={(e) => createFloorForm.setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createFloorForm.errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createFloorForm.errors.description && <p className="text-red-500 text-xs mt-1">{createFloorForm.errors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Planta</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Sheet para editar planta */}
            <Sheet open={editFloorForm.isEditSheetOpen} onOpenChange={editFloorForm.setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Planta</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar la planta.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={editFloorForm.handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_floor_name">Nombre</Label>
                            <Input
                                id="edit_floor_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre de la planta"
                                value={editFloorForm.editFloorName}
                                onChange={(e) => editFloorForm.setEditFloorName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editFloorForm.editErrors.floor_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editFloorForm.editErrors.floor_name && <p className="text-red-500 text-xs mt-1">{editFloorForm.editErrors.floor_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción de la planta"
                                value={editFloorForm.editDescription}
                                onChange={(e) => editFloorForm.setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editFloorForm.editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editFloorForm.editErrors.description && <p className="text-red-500 text-xs mt-1">{editFloorForm.editErrors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Actualizar Planta</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <DataTable columns={columns} data={floors} />
        </div>
    );
}