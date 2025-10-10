import { useState, useCallback, useMemo } from "react";
import { useRoles } from "@/hooks/useRoles";
import { useEventListener } from "@/hooks/useEventListener";
import { createRoleHandlers } from "@/app/(dashboard)/roles/handlers";
import { Rol } from "@/types/rol";

interface Role {
    id: number;
    rol_name: string;
    description: string;
}

export const useRoleManagement = () => {
    const { roles, createRole, updateRole, deleteRole, refetch } = useRoles();

    // Estados para crear rol
    const [rol_name, setRolName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
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

    // Escuchar eventos de cambios en roles
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'roles' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('roles-updated', refetch);

    // Wrapper functions para los handlers con los estados
    const handleEdit = useCallback((rol: Rol) => {
        // Convertir Rol a Role para los handlers
        const role: Role = {
            id: parseInt(rol.id),
            rol_name: rol.rol_name,
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
            rol_name: rol.rol_name,
            description: rol.description
        };
        
        handlers.handleDelete(role);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleSubmit(
            e,
            rol_name,
            description,
            setErrors,
            setRolName,
            setDescription
        );
    }, [handlers, rol_name, description]);

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
        rol_name,
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
        createRoleForm,
        editRoleForm,
        handleEdit,
        handleDelete,
        refetch
    };
};