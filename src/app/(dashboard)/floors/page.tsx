"use client";
import { useFloors } from "@/hooks/useFloors";
import { createColumns } from "./columns"
import { createFloorHandlers } from "./handlers";
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useMemo } from "react";
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

export default function FloorsPage() {
    const { floors, createFloor, updateFloor, deleteFloor, refetch } = useFloors();
    const [floor_name, setFloorName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estados para editar planta
    const [editingFloor, setEditingFloor] = useState<any>(null);
    const [editFloorName, setEditFloorName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Crear handlers
    const handlers = createFloorHandlers({
        createFloor,
        updateFloor,
        deleteFloor
    });

    // Escuchar eventos de cambios en plantas
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'floors' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('floors-updated', refetch);

    // Wrapper functions para los handlers con los estados
    const handleEdit = useCallback((floor: any) => {
        handlers.handleEdit(
            floor,
            setEditingFloor,
            setEditFloorName,
            setEditDescription,
            setEditErrors,
            setIsEditSheetOpen
        );
    }, [handlers]);

    const handleDelete = useCallback((floor: any) => {
        handlers.handleDelete(floor);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleSubmit(
            e,
            floor_name,
            description,
            setErrors,
            setFloorName,
            setDescription
        );
    }, [handlers, floor_name, description]);

    const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleEditSubmit(
            e,
            editingFloor,
            editFloorName,
            editDescription,
            setEditErrors,
            setEditingFloor,
            setEditFloorName,
            setEditDescription,
            setIsEditSheetOpen
        );
    }, [handlers, editingFloor, editFloorName, editDescription]);

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
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="floor_name">Nombre</Label>
                            <Input
                                id="floor_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre de la planta"
                                value={floor_name}
                                onChange={(e) => setFloorName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.floor_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.floor_name && <p className="text-red-500 text-xs mt-1">{errors.floor_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción de la planta"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Planta</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar la planta.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_floor_name">Nombre</Label>
                            <Input
                                id="edit_floor_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre de la planta"
                                value={editFloorName}
                                onChange={(e) => setEditFloorName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.floor_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.floor_name && <p className="text-red-500 text-xs mt-1">{editErrors.floor_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción de la planta"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.description && <p className="text-red-500 text-xs mt-1">{editErrors.description}</p>}
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