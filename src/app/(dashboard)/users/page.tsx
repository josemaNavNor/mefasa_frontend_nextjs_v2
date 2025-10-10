"use client";
import { createColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo } from "react";
import { useRoles } from "@/hooks/useRoles";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserManagement } from "@/hooks/useUserManagement";

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
    const { roles } = useRoles();
    const { 
        users, 
        createUserForm, 
        editUserForm, 
        handleEdit, 
        handleDelete 
    } = useUserManagement();

    // Crear las columnas con las funciones handleEdit y handleDelete usando useMemo
    const columns = useMemo(() => createColumns({ 
        onEdit: handleEdit, onDelete: handleDelete 
    }), [handleEdit, handleDelete]);

    return (
        <ProtectedRoute allowedRoles={["Administrador"]}>
            <div className="w-full px-4 py-4">
                <div className="mb-4">
                    <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                </div>
            
            {/* Sheet para agregar usuario */}
            <Sheet open={createUserForm.isCreateSheetOpen} onOpenChange={createUserForm.setIsCreateSheetOpen}>
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
                    <form onSubmit={createUserForm.handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Nombres</Label>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del usuario"
                                value={createUserForm.name}
                                onChange={(e) => createUserForm.setName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.name && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="last_name">Apellidos</Label>
                            <Input
                                id="last_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Apellido del usuario"
                                value={createUserForm.last_name}
                                onChange={(e) => createUserForm.setLastName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.last_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.last_name && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.last_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="off"
                                placeholder="Correo electrónico"
                                value={createUserForm.email}
                                onChange={(e) => createUserForm.setEmail(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.email ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.email && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.email}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ingrese su contraseña"
                                value={createUserForm.password}
                                onChange={(e) => createUserForm.setPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.password ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.password && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.password}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirme su contraseña"
                                value={createUserForm.confirmPassword}
                                onChange={(e) => createUserForm.setConfirmPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.confirmPassword ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.confirmPassword}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="phone_number">Número de teléfono</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder="Ingrese su número de teléfono"
                                value={createUserForm.phone_number}
                                onChange={(e) => createUserForm.setPhoneNumber(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.phone_number ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {createUserForm.errors.phone_number && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.phone_number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="role_id">Rol</Label>
                            <Select
                                value={createUserForm.roleId}
                                onValueChange={createUserForm.setRoleId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${createUserForm.errors.role_id ? ' border-red-500' : ' border-gray-200'}`}>
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
                            {createUserForm.errors.role_id && <p className="text-red-500 text-xs mt-1">{createUserForm.errors.role_id}</p>}
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
            <Sheet open={editUserForm.isEditSheetOpen} onOpenChange={editUserForm.setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Usuario</SheetTitle>
                        <SheetDescription>
                            Modifica los campos necesarios para actualizar el usuario.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={editUserForm.handleEditSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit_name">Nombres</Label>
                            <Input
                                id="edit_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Nombre del usuario"
                                value={editUserForm.editName}
                                onChange={(e) => editUserForm.setEditName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.name && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_last_name">Apellidos</Label>
                            <Input
                                id="edit_last_name"
                                type="text"
                                autoComplete="off"
                                placeholder="Apellido del usuario"
                                value={editUserForm.editLastName}
                                onChange={(e) => editUserForm.setEditLastName(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.last_name ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.last_name && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.last_name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_email">Correo electrónico</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                autoComplete="off"
                                placeholder="Correo electrónico"
                                value={editUserForm.editEmail}
                                onChange={(e) => editUserForm.setEditEmail(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.email ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.email && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.email}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_password">Nueva Contraseña (opcional)</Label>
                            <Input
                                id="edit_password"
                                type="password"
                                placeholder="Dejar vacío para mantener la actual"
                                value={editUserForm.editPassword}
                                onChange={(e) => editUserForm.setEditPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.password ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.password && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.password}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_confirm_password">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="edit_confirm_password"
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                value={editUserForm.editConfirmPassword}
                                onChange={(e) => editUserForm.setEditConfirmPassword(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.confirmPassword ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.confirmPassword}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_phone_number">Número de teléfono</Label>
                            <Input
                                id="edit_phone_number"
                                type="tel"
                                placeholder="Ingrese su número de teléfono"
                                value={editUserForm.editPhoneNumber}
                                onChange={(e) => editUserForm.setEditPhoneNumber(e.target.value)}
                                className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.phone_number ? ' border-red-500' : ' border-gray-200'}`}
                            />
                            {editUserForm.editErrors.phone_number && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.phone_number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit_role_id">Rol</Label>
                            <Select
                                value={editUserForm.editRoleId}
                                onValueChange={editUserForm.setEditRoleId}
                            >
                                <SelectTrigger className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${editUserForm.editErrors.role_id ? ' border-red-500' : ' border-gray-200'}`}>
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
                            {editUserForm.editErrors.role_id && <p className="text-red-500 text-xs mt-1">{editUserForm.editErrors.role_id}</p>}
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