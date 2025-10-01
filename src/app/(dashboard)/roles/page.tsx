"use client";
import { useRoles } from "@/hooks/useRoles";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react";
import { roleSchema } from "@/lib/zod";
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
    const { roles, createRole, refetch } = useRoles();
    const [rol_name, setRolName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Escuchar eventos de cambios en roles
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'roles' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('roles-updated', refetch);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = roleSchema.safeParse({ rol_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                rol_name: formatted.rol_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        
        await createRole({
            rol_name,
            description,
        });
        
        // Limpiar formulario solo si fue exitoso
        setRolName("");
        setDescription("");
        setErrors({});
    }

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
            <DataTable columns={columns} data={roles} />
        </div>
    );
}