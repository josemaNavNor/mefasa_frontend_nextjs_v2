"use client";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo, useState, useCallback } from "react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useEventListener } from "@/hooks/useEventListener";
import { ROLE_EVENTS } from "@/lib/events";
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

export default function RolesPage() {
    const { 
        roles, 
        createRoleForm, 
        editRoleForm, 
        isCreateSheetOpen,
        setIsCreateSheetOpen,
        handleEdit, 
        handleDelete 
    } = useRoleManagement();

    // Crear las columnas con las funciones handleEdit y handleDelete usando useMemo
    const columns = useMemo(() => createColumns({ 
        onEdit: handleEdit, 
        onDelete: handleDelete 
    }), [handleEdit, handleDelete]);

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestion de Roles</h1>
            </div>
            <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Rol</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Rol</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar un nuevo rol.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={createRoleForm.handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="rol_name">Nombre</Label>
                            <Input
                                id="rol_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del rol"
                                value={createRoleForm.rol_name}
                                onChange={(e) => createRoleForm.setRolName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createRoleForm.errors.rol_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createRoleForm.errors.rol_name && <p className="text-red-500 text-xs mt-1">{createRoleForm.errors.rol_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripcion</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del rol"
                                value={createRoleForm.description}
                                onChange={(e) => createRoleForm.setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createRoleForm.errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createRoleForm.errors.description && <p className="text-red-500 text-xs mt-1">{createRoleForm.errors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Rol</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Sheet para editar rol */}
            <Sheet open={editRoleForm.isEditSheetOpen} onOpenChange={editRoleForm.setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Rol</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el rol.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={editRoleForm.handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_rol_name">Nombre</Label>
                            <Input
                                id="edit_rol_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del rol"
                                value={editRoleForm.editRolName}
                                onChange={(e) => editRoleForm.setEditRolName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editRoleForm.editErrors.rol_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editRoleForm.editErrors.rol_name && <p className="text-red-500 text-xs mt-1">{editRoleForm.editErrors.rol_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del rol"
                                value={editRoleForm.editDescription}
                                onChange={(e) => editRoleForm.setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editRoleForm.editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editRoleForm.editErrors.description && <p className="text-red-500 text-xs mt-1">{editRoleForm.editErrors.description}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Actualizar Rol</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <DataTable columns={columns} data={roles} />
        </div>
    );
}