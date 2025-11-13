import { useState, useCallback, useMemo } from "react";
import { useRoles } from "@/hooks/useRoles";
import { useEventListener } from "@/hooks/useEventListener";
import { createRoleHandlers } from "@/app/(dashboard)/roles/handlers";
import { Rol } from "@/types/rol";
import { ROLE_EVENTS } from "@/lib/events";
import { eventEmitter } from "./useEventListener";

interface Role {
    id: number;
    role_name: string;
    description: string;
}

export const useRoleManagement = () => {
    const { roles, createRole, updateRole, deleteRole, refetch } = useRoles();

    // Estados para crear rol
    const [role_name, setRolName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estado del Sheet para crear rol - manejado internamente
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Estados para editar rol
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editRolName, setEditRolName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Crear handlers
    const handlers = useMemo(() => createRoleHandlers({
        createRole,
        updateRole,
        deleteRole
    }), [createRole, updateRole, deleteRole]);

    // Escuchar eventos específicos de roles
    const handleDataChange = useCallback(() => {
        refetch();
    }, [refetch]);

    useEventListener(ROLE_EVENTS.CREATED, handleDataChange);
    useEventListener(ROLE_EVENTS.UPDATED, handleDataChange);
    useEventListener(ROLE_EVENTS.DELETED, handleDataChange);

    // Wrapper functions para los handlers con los estados
    const handleEdit = useCallback((rol: Rol) => {
        // Convertir Rol a Role para los handlers
        const role: Role = {
            id: parseInt(rol.id),
            role_name: rol.role_name,
            description: rol.description
        };
        
        handlers.handleEdit(
            role,
            setEditingRole,
            setEditRolName,
            setEditDescription,
            setEditErrors,
            setIsEditSheetOpen
        );
    }, [handlers]);

    const handleDelete = useCallback((rol: Rol) => {
        // Convertir Rol a Role para los handlers
        const role: Role = {
            id: parseInt(rol.id),
            role_name: rol.role_name,
            description: rol.description
        };
        
        handlers.handleDelete(role);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleSubmit(
            e,
            role_name,
            description,
            setErrors,
            setRolName,
            setDescription,
            () => {
                // Emitir evento para cerrar Sheet
                eventEmitter.emit(ROLE_EVENTS.CLOSE_FORM);
            }
        );
    }, [handlers, role_name, description]);

    const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
        if (!editingRole) return;
        
        await handlers.handleEditSubmit(
            e,
            editingRole,
            editRolName,
            editDescription,
            setEditErrors,
            setEditingRole,
            setEditRolName,
            setEditDescription,
            setIsEditSheetOpen
        );
    }, [handlers, editingRole, editRolName, editDescription]);

    // Estados del formulario de creación
    const createRoleForm = {
        role_name,
        setRolName,
        description,
        setDescription,
        errors,
        handleSubmit
    };

    // Estados del formulario de edición
    const editRoleForm = {
        editingRole,
        editRolName,
        setEditRolName,
        editDescription,
        setEditDescription,
        editErrors,
        isEditSheetOpen,
        setIsEditSheetOpen,
        handleEditSubmit
    };

    return {
        roles,
        createRoleForm: {
            role_name,
            setRolName,
            description,
            setDescription,
            errors,
            handleSubmit
        },
        editRoleForm: {
            editingRole,
            editRolName,
            setEditRolName,
            editDescription,
            setEditDescription,
            editErrors,
            isEditSheetOpen,
            setIsEditSheetOpen,
            handleEditSubmit
        },
        // Estado interno del Sheet para la página
        isSheetOpen,
        setIsSheetOpen,
        handleEdit,
        handleDelete,
        refetch
    };
};