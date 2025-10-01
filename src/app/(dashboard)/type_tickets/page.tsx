"use client";
import { useType } from "@/hooks/use_typeTickets";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react";
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
    const { types, createTicketType, refetch } = useType();
    const [description, setDescription] = useState("");
    const [type_name, setTicketTypeName] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Escuchar eventos de cambios en tipos de tickets
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'types' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('types-updated', refetch);

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
            <DataTable columns={columns} data={types} />
        </div>
    );
}