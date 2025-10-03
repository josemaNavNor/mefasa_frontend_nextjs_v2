"use client";
import { usePermissions } from "@/hooks/usePermissions";
import { useModules } from "@/hooks/use_module";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { permissionSchema } from "@/lib/zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PermissionsPage() {
    const { permissions } = usePermissions();
    const { modules } = useModules();
    const { createPermission } = usePermissions();
    const [perm_name, setPermName] = useState("");
    const [moduleId, setModuleId] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = permissionSchema.safeParse({ perm_name, moduleId, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                perm_name: formatted.perm_name?._errors[0] || '',
                moduleId: formatted.moduleId?._errors[0] || '', 
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        await createPermission({
            perm_name,
            module_id: Number(moduleId),
            description,
        });
        setPermName("");
        setModuleId("");
        setDescription("");
        setErrors({});
    }

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestion de Permisos</h1>
            </div>
            <div className="mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">Agregar Permiso</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Agregar Permiso</SheetTitle>
                            <SheetDescription>
                                Completa los campos a continuación para agregar un nuevo permiso.
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="perm_name">Nombre</Label>
                                <Input
                                    id="perm_name"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Nombre del permiso"
                                    value={perm_name}
                                    onChange={(e) => setPermName(e.target.value)}
                                    className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.perm_name ? ' border-red-500' : ' border-gray-200'}`}
                                />
                                {errors.perm_name && <p className="text-red-500 text-xs mt-1">{errors.perm_name}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="module_id">Modulo al que pertenece</Label>
                                <Select
                                    value={moduleId}
                                    onValueChange={setModuleId}
                                >
                                    <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.moduleId ? ' border-red-500' : ' border-gray-200'}`}>
                                        <SelectValue placeholder="Selecciona un módulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={String(module.id)}>
                                                {module.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.moduleId && <p className="text-red-500 text-xs mt-1">{errors.moduleId}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Descripcion</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Descripcion del permiso"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.description ? ' border-red-500' : ' border-gray-200'}`}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <SheetFooter>
                                <Button type="submit">Agregar Permiso</Button>
                                <SheetClose asChild>
                                    <Button variant="outline">Cerrar</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable columns={columns} data={permissions} />
        </div>
    );
}