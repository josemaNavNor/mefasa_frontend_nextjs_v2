"use client";
import { useFloors } from "@/hooks/useFloors";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { floorSchema } from "@/lib/zod";
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

export default function FloorsPage() {
    const { floors } = useFloors();
    const { createFloor } = useFloors();
    const [floor_name, setFloorName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = floorSchema.safeParse({ floor_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                floor_name: formatted.floor_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        await createFloor({
            floor_name,
            description,
        });
        setFloorName("");
        setDescription("");
        setErrors({});
    }

    //if (loading) return <p>Cargando roles...</p>;

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestion de Plantas</h1>
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
                            <Label htmlFor="sheet-demo-name">Nombre</Label>
                            <Input
                                id="floor_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre de la planta"
                                value={floor_name}
                                onChange={(e) => setFloorName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.rol_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.floor_name && <p className="text-red-500 text-xs mt-1">{errors.floor_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Descripcion</Label>
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
            <DataTable columns={columns} data={floors} />
        </div>
    );
}
