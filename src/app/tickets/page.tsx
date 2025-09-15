"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { columns, User } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { useTickets } from "@/hooks/use_tickets";
import { useType } from "@/hooks/use_typeTickets";
//import { userSchema } from "@/lib/zod";
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
export default function UsersPage() {
    const { tickets } = useTickets();
    const { types } = useType();
    const { createTicket } = useTickets();
    const [ticket_number, setTicketNumber] = useState("");
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [end_user_id, setEndUserId] = useState("");
    const [technician_id, setTechnicianId] = useState("");
    const [type_id, setTypeId] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");
    const [due_date, setDueDate] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        // const result = userSchema.safeParse({
        //     name,
        //     last_name,
        //     email,
        //     password,
        //     phone_number,
        //     role_id: Number(roleId),
        // });
        // // maneja los errores de validacion de campos con zod
        // if (!result.success) {
        //     const formatted = result.error.format();
        //     setErrors({
        //         name: formatted.name?._errors?.[0] || "",
        //         last_name: formatted.last_name?._errors?.[0] || "",
        //         email: formatted.email?._errors?.[0] || "",
        //         password: formatted.password?._errors?.[0] || "",
        //         phone_number: formatted.phone_number?._errors?.[0] || "",
        //         role_id: formatted.role_id?._errors?.[0] || "",
        //     });
        //     return;
        // }
        await createTicket({
            ticket_number,
            summary,
            description,
            end_user_id: Number(end_user_id),
            technician_id: Number(technician_id),
            type_id: Number(type_id),
            priority,
            status,
            due_date
        });
        setTicketNumber("");
        setSummary("");
        setDescription("");
        setEndUserId("");
        setTechnicianId("");
        setTypeId("");
        setPriority("");
        setStatus("");
        setDueDate("");
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Tickets</h1>
            </div>
            <Sheet>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Ticket</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Ticket</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar un nuevo ticket.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-name">Titulo</Label>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="off"
                                placeholder="Titulo del ticket"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.summary ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Descripcion</Label>
                            <Input
                                id="last_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Descripcion del ticket"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.description ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-role">Tipo de ticket</Label>
                            <Select
                                value={type_id}
                                onValueChange={setTypeId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.type_id ? ' border-red-500' : ' border-gray-200'}`}>
                                    <SelectValue placeholder="Selecciona un tipo de ticket" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((useType) => (
                                        <SelectItem key={useType.id} value={String(useType.id)}>
                                            {useType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type_id && <p className="text-red-500 text-xs mt-1">{errors.type_id}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-role">Tipo de ticket</Label>
                            <Select
                                value={type_id}
                                onValueChange={setTypeId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.type_id ? ' border-red-500' : ' border-gray-200'}`}>
                                    <SelectValue placeholder="Selecciona un tipo de ticket" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((useType) => (
                                        <SelectItem key={useType.id} value={String(useType.id)}>
                                            {useType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type_id && <p className="text-red-500 text-xs mt-1">{errors.type_id}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Ticket</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
            <DataTable columns={columns} data={tickets} />
        </div>
    );
}
