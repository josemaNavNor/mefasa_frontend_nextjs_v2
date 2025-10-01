"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react";
import { useRoles } from "@/hooks/useRoles";
import { userSchema } from "@/lib/zod";
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

export default function UsersPage() {
    const { users, createUser, refetch } = useUsers();
    const { roles } = useRoles();
    const [name, setName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Escuchar eventos de cambios en usuarios
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'users' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('users-updated', refetch);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        const result = userSchema.safeParse({
            name,
            last_name,
            email,
            password,
            phone_number,
            role_id: Number(roleId),
        });

        // Maneja los errores de validación de campos con zod
        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                name: formatted.name?._errors?.[0] || "",
                last_name: formatted.last_name?._errors?.[0] || "",
                email: formatted.email?._errors?.[0] || "",
                password: formatted.password?._errors?.[0] || "",
                phone_number: formatted.phone_number?._errors?.[0] || "",
                role_id: formatted.role_id?._errors?.[0] || "",
            });
            return;
        }

        await createUser({
            name,
            last_name,
            email,
            password,
            phone_number,
            role_id: Number(roleId),
            is_email_verified: false,
            email_verification_token: '',
            two_factor_enable: false,
            two_factor_secret: ''
        });

        // Limpiar formulario solo si fue exitoso
        setName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setRoleId("");
        setErrors({});
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
            </div>
            <Sheet>
                <SheetTrigger asChild className="mb-4">
                    <Button variant="outline">Agregar Usuario</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Usuario</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar un nuevo usuario.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Nombres</Label>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del usuario"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="last_name">Apellidos</Label>
                            <Input
                                id="last_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Apellido del usuario"
                                value={last_name}
                                onChange={(e) => setLastName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.last_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="off"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.email ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ingrese su contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.password ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="phone_number">Número de teléfono</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder="Ingrese su número de teléfono"
                                value={phone_number}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.phone_number ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="role_id">Rol</Label>
                            <Select
                                value={roleId}
                                onValueChange={setRoleId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.role_id ? ' border-red-500' : ' border-gray-200'}`}>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.rol_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Agregar Usuario</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
            <DataTable columns={columns} data={users} />
        </div>
    );
}