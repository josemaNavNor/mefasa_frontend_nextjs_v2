"use client";
import { useRoles } from "@/hooks/useRoles";
import { createColumns } from "./columns"
import { createRoleHandlers } from "./handlers";
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

export default function RolesPage() {
    const { roles, createRole, updateRole, deleteRole, refetch } = useRoles();
    const [rol_name, setRolName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estados para editar rol
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editRolName, setEditRolName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Crear handlers
    const handlers = createRoleHandlers({
        createRole,
        updateRole,
        deleteRole
    });

    // Escuchar eventos de cambios en roles
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'roles' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('roles-updated', refetch);

    // Wrapper functions para los handlers con los estados
    const handleEdit = useCallback((role: any) => {
        handlers.handleEdit(
            role,
            setEditingRole,
            setEditRolName,
            setEditDescription,
            setEditErrors,
            setIsEditSheetOpen
        );
    }, [handlers]);

    const handleDelete = useCallback((role: any) => {
        handlers.handleDelete(role);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleSubmit(
            e,
            rol_name,
            description,
            setErrors,
            setRolName,
            setDescription
        );
    }, [handlers, rol_name, description]);

    const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleEditSubmit(
            e,
            editingRole,
            editRolName,
            editDescription,
            setEditErrors,
            setEditingRole,
            setEditRolName,
            setEditDescription,
            setIsEditSheetOpen
        );
    }, [handlers, editingRole, editRolName, editDescription]);

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
            <Sheet>
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
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="rol_name">Nombre</Label>
                            <Input
                                id="rol_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del rol"
                                value={rol_name}
                                onChange={(e) => setRolName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.rol_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.rol_name && <p className="text-red-500 text-xs mt-1">{errors.rol_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Descripcion</Label>
                            <Input
                                id="description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del rol"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Rol</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el rol.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_rol_name">Nombre</Label>
                            <Input
                                id="edit_rol_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del rol"
                                value={editRolName}
                                onChange={(e) => setEditRolName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.rol_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.rol_name && <p className="text-red-500 text-xs mt-1">{editErrors.rol_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_description">Descripción</Label>
                            <Input
                                id="edit_description"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripción del rol"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.description && <p className="text-red-500 text-xs mt-1">{editErrors.description}</p>}
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