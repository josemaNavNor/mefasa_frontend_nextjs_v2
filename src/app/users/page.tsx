"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { columns, User } from "./columns"
import { DataTable } from "./data-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    const { users, loading } = useUsers();

    if (loading) return <p>Cargando usuarios...</p>;

    return (
        <div className="w-full px-4 py-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Agregar Usuario</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Agregar Usuario</SheetTitle>
                        <SheetDescription>
                            Completa los campos a continuación para agregar un nuevo usuario.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-name">Nombres</Label>
                            <Input id="sheet-demo-name" placeholder="Ingrese sus nombres" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Apellidos</Label>
                            <Input id="sheet-demo-username" placeholder="Ingrese sus apellidos" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-email">Correo electronico</Label>
                            <Input id="sheet-demo-email" placeholder="Ingrese su correo electronico" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-password">Contraseña</Label>
                            <Input id="sheet-demo-password" type="password" placeholder="Ingrese su contraseña"/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Numero de telefono</Label>
                            <Input id="sheet-demo-username" placeholder="Ingrese su numero de telefono"/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-role">Rol</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="submit">Agregar Usuario</Button>
                        <SheetClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <DataTable columns={columns} data={users} />
        </div>
    );
}
