"use client";
import { useAreas } from "@/hooks/useAreas";
import { useFloors } from "@/hooks/useFloors";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react";
import { areaSchema } from "@/lib/zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AreasPage() {
    const { areas, createArea, refetch } = useAreas();
    const { floors } = useFloors();
    const [area_name, setAreaName] = useState("");
    const [floorId, setFloorId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Escuchar eventos de cambios en areas
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'areas' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('areas-updated', refetch);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = areaSchema.safeParse({ area_name, floor_id: Number(floorId)});

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                area_name: formatted.area_name?._errors[0] || '',
                floor_id: formatted.floor_id?._errors[0] || '',
            });
            return;
        }
        
        await createArea({
            area_name,
            floor_id: Number(floorId)
        });
        
        // Limpiar formulario solo si fue exitoso
        setAreaName("");
        setFloorId("");
        setErrors({});
    }

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestión de Areas</h1>
            </div>
            <Sheet>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Area</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Area</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar una nueva área.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="area_name">Nombre</Label>
                            <Input
                                id="area_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del área"
                                value={area_name}
                                onChange={(e) => setAreaName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.area_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.area_name && <p className="text-red-500 text-xs mt-1">{errors.area_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="floor_id">Planta</Label>
                            <Select
                                value={floorId}
                                onValueChange={setFloorId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.floor_id ? ' border-red-500' : ' border-gray-200'}`}>
                                    <SelectValue placeholder="Selecciona una planta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {floors.map((floor) => (
                                        <SelectItem key={floor.id} value={String(floor.id)}>
                                            {floor.floor_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.floor_id && <p className="text-red-500 text-xs mt-1">{errors.floor_id}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Área</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
            <DataTable columns={columns} data={areas} />
        </div>
    );
}