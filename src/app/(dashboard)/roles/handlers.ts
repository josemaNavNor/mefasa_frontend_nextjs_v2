import { roleSchema } from "@/lib/zod";
import Notiflix from 'notiflix';

interface Role {
    id: number;
    role_name: string;
    description: string;
}

interface RoleHandlersProps {
    createRole: (data: { role_name: string; description: string }) => Promise<void>;
    updateRole: (id: number, data: { role_name?: string; description?: string }) => Promise<any>;
    deleteRole: (id: number) => Promise<boolean>;
}

export const createRoleHandlers = ({
    createRole,
    updateRole,
    deleteRole
}: RoleHandlersProps) => {
    
    const handleEdit = (
        role: Role,
        setEditingRole: (role: Role | null) => void,
        setEditRolName: (name: string) => void,
        setEditDescription: (desc: string) => void,
        setEditErrors: (errors: { [key: string]: string }) => void,
        setIsEditSheetOpen: (open: boolean) => void
    ) => {
        setEditingRole(role);
        setEditRolName(role.role_name);
        setEditDescription(role.description);
        setEditErrors({});
        setIsEditSheetOpen(true);
    };

    const handleDelete = (role: Role): void => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar el rol "${role.role_name}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await deleteRole(role.id);
            },
            () => {
                // Cancelado, no hacer nada
            },
            {
                width: '320px',
                borderRadius: '8px',
                titleColor: '#f43f5e',
                okButtonBackground: '#f43f5e',
            }
        );
    };

    const handleSubmit = async (
        e: React.FormEvent,
        role_name: string,
        description: string,
        setErrors: (errors: { [key: string]: string }) => void,
        setRolName: (name: string) => void,
        setDescription: (desc: string) => void,
        closeSheet?: () => void
    ) => {
        e.preventDefault();
        setErrors({});
        
        const result = roleSchema.safeParse({ role_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                role_name: formatted.role_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        
        try {
            await createRole({
                role_name,
                description,
            });
            
            // Limpiar formulario
            setRolName("");
            setDescription("");
            setErrors({});
            
            // Cerrar Sheet si se proporcionó la función
            if (closeSheet) {
                closeSheet();
            }
        } catch (error) {
            // El error ya se maneja en createRole
        }
    };

    const handleEditSubmit = async (
        e: React.FormEvent,
        editingRole: Role,
        editRolName: string,
        editDescription: string,
        setEditErrors: (errors: { [key: string]: string }) => void,
        setEditingRole: (role: Role | null) => void,
        setEditRolName: (name: string) => void,
        setEditDescription: (desc: string) => void,
        setIsEditSheetOpen: (open: boolean) => void
    ) => {
        e.preventDefault();
        setEditErrors({});
        
        const result = roleSchema.safeParse({ role_name: editRolName, description: editDescription });

        if (!result.success) {
            const formatted = result.error.format();
            setEditErrors({
                role_name: formatted.role_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }

        await updateRole(editingRole.id, {
            role_name: editRolName,
            description: editDescription,
        });

        // Limpiar formulario y cerrar modal
        setEditingRole(null);
        setEditRolName("");
        setEditDescription("");
        setEditErrors({});
        setIsEditSheetOpen(false);
    };

    return {
        handleEdit,
        handleDelete,
        handleSubmit,
        handleEditSubmit
    };
};