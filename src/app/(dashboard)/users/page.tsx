"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useMemo } from "react";
import { useRoles } from "@/hooks/useRoles";
import { userSchema } from "@/lib/zod";
import { useEventListener } from "@/hooks/useEventListener";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
    const { users, createUser, updateUser, refetch } = useUsers();
    const { roles } = useRoles();
    
    // Estados para crear usuario
    const [name, setName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estados para editar usuario
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editRoleId, setEditRoleId] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Función para manejar la edición
    const handleEdit = useCallback((user: any) => {
        setEditingUser(user);
        setEditName(user.name);
        setEditLastName(user.last_name);
        setEditEmail(user.email);
        setEditPhoneNumber(user.phone_number || "");
        setEditPassword("");
        setEditRoleId(String(user.role?.id || ""));
        setEditErrors({});
        setIsEditSheetOpen(true);
    }, []);

    // Crear las columnas con la función handleEdit usando useMemo
    const columns = useMemo(() => createColumns({ onEdit: handleEdit }), [handleEdit]);

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

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditErrors({});
        
        // Validación para actualización (password opcional)
        const updateData = {
            name: editName,
            last_name: editLastName,
            email: editEmail,
            phone_number: editPhoneNumber,
            role_id: Number(editRoleId),
            ...(editPassword && { password: editPassword })
        };

        // Validación básica manual ya que el password es opcional en actualización
        const validationErrors: { [key: string]: string } = {};
        
        if (!editName.trim()) validationErrors.name = "El nombre es requerido";
        if (!editLastName.trim()) validationErrors.last_name = "El apellido es requerido";
        if (!editEmail.trim()) validationErrors.email = "El email es requerido";
        if (!editRoleId) validationErrors.role_id = "El rol es requerido";
        
        if (Object.keys(validationErrors).length > 0) {
            setEditErrors(validationErrors);
            return;
        }

        await updateUser(editingUser.id, updateData);

        // Limpiar formulario y cerrar modal
        setEditingUser(null);
        setEditName("");
        setEditLastName("");
        setEditEmail("");
        setEditPhoneNumber("");
        setEditPassword("");
        setEditRoleId("");
        setEditErrors({});
        setIsEditSheetOpen(false);
    };

    return (
        <ProtectedRoute allowedRoles="Administrador">
            <div className="w-full px-4 py-4">
                <div className="mb-4">
                    <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                </div>
            
            {/* Sheet para agregar usuario */}
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

            {/* Sheet para editar usuario */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Usuario</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el usuario.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_name">Nombres</Label>
                            <Input
                                id="edit_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del usuario"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_last_name">Apellidos</Label>
                            <Input
                                id="edit_last_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Apellido del usuario"
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.last_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.last_name && <p className="text-red-500 text-xs mt-1">{editErrors.last_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_email">Correo electrónico</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                autoComplete="off"
                                placeholder="Correo electrónico"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.email ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_password">Nueva Contraseña (opcional)</Label>
                            <Input
                                id="edit_password"
                                type="password"
                                placeholder="Dejar vacío para mantener la actual"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.password ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.password && <p className="text-red-500 text-xs mt-1">{editErrors.password}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_phone_number">Número de teléfono</Label>
                            <Input
                                id="edit_phone_number"
                                type="tel"
                                placeholder="Ingrese su número de teléfono"
                                value={editPhoneNumber}
                                onChange={(e) => setEditPhoneNumber(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.phone_number ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editErrors.phone_number && <p className="text-red-500 text-xs mt-1">{editErrors.phone_number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_role_id">Rol</Label>
                            <Select
                                value={editRoleId}
                                onValueChange={setEditRoleId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editErrors.role_id ? ' border-red-500' : ' border-gray-200'}`}>
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
                            {editErrors.role_id && <p className="text-red-500 text-xs mt-1">{editErrors.role_id}</p>}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Actualizar Usuario</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <DataTable columns={columns} data={users} />
            </div>
        </ProtectedRoute>
    );
}