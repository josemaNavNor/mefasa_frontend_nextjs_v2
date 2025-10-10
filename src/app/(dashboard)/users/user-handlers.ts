import Notiflix from 'notiflix';
import { userSchema } from "@/lib/zod";
import { UserFormData, EditUserFormData, FormState, EditFormState  } from "@/types/forms-user";

export interface UserHandlersProps {
    createUser: (data: any) => Promise<void>;
    updateUser: (id: number, data: any) => Promise<void>;
    deleteUser: (id: number) => Promise<boolean>;
}

export interface FormActions {
    setName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPhoneNumber: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setRoleId: (value: string) => void;
    setErrors: (errors: { [key: string]: string }) => void;
    setIsCreateSheetOpen: (open: boolean) => void;
}

export interface EditFormActions {
    setEditName: (value: string) => void;
    setEditLastName: (value: string) => void;
    setEditEmail: (value: string) => void;
    setEditPhoneNumber: (value: string) => void;
    setEditPassword: (value: string) => void;
    setEditConfirmPassword: (value: string) => void;
    setEditRoleId: (value: string) => void;
    setEditErrors: (errors: { [key: string]: string }) => void;
    setEditingUser: (user: any) => void;
    setIsEditSheetOpen: (open: boolean) => void;
}

// Handler para editar usuario
export const createHandleEdit = (editActions: EditFormActions) => {
    return (user: any) => {
        editActions.setEditingUser(user);
        editActions.setEditName(user.name);
        editActions.setEditLastName(user.last_name);
        editActions.setEditEmail(user.email);
        editActions.setEditPhoneNumber(user.phone_number || "");
        editActions.setEditPassword("");
        editActions.setEditConfirmPassword("");
        editActions.setEditRoleId(String(user.role?.id || ""));
        editActions.setEditErrors({});
        editActions.setIsEditSheetOpen(true);
    };
};

// Handler para eliminar usuario
export const createHandleDelete = (userHandlers: UserHandlersProps) => {
    return (user: any) => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar al usuario "${user.name} ${user.last_name}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await userHandlers.deleteUser(user.id);
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
};

// Handler para crear usuario
export const createHandleSubmit = (
    userHandlers: UserHandlersProps,
    formState: FormState,
    formActions: FormActions
) => {
    return async (e: React.FormEvent) => {
        e.preventDefault();
        formActions.setErrors({});
        
        const { name, last_name, email, phone_number, password, confirmPassword, roleId } = formState;
        
        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            formActions.setErrors({
                confirmPassword: "Las contraseñas no coinciden"
            });
            return;
        }

        const result = userSchema.safeParse({
            name,
            last_name,
            email,
            password,
            phone_number,
            role_id: Number(roleId),
        });

        // Maneja los errores de validacion de campos con zod
        if (!result.success) {
            const formatted = result.error.format();
            formActions.setErrors({
                name: formatted.name?._errors?.[0] || "",
                last_name: formatted.last_name?._errors?.[0] || "",
                email: formatted.email?._errors?.[0] || "",
                password: formatted.password?._errors?.[0] || "",
                phone_number: formatted.phone_number?._errors?.[0] || "",
                role_id: formatted.role_id?._errors?.[0] || "",
            });
            return;
        }

        // Crear usuario si todo es valido
        await userHandlers.createUser({
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
        formActions.setName("");
        formActions.setLastName("");
        formActions.setEmail("");
        formActions.setPassword("");
        formActions.setConfirmPassword("");
        formActions.setPhoneNumber("");
        formActions.setRoleId("");
        formActions.setErrors({});
        formActions.setIsCreateSheetOpen(false);
    };
};

// Handler para editar usuario 
export const createHandleEditSubmit = (
    userHandlers: UserHandlersProps,
    editFormState: EditFormState,
    editActions: EditFormActions,
    editingUser: any
) => {
    return async (e: React.FormEvent) => {
        e.preventDefault();
        editActions.setEditErrors({});
        
        const { editName, editLastName, editEmail, editPhoneNumber, editPassword, editConfirmPassword, editRoleId } = editFormState;
        
        // Validación básica manual
        const validationErrors: { [key: string]: string } = {};
        
        if (!editName.trim()) validationErrors.name = "El nombre es requerido";
        if (!editLastName.trim()) validationErrors.last_name = "El apellido es requerido";
        if (!editEmail.trim()) validationErrors.email = "El email es requerido";
        if (!editRoleId) validationErrors.role_id = "El rol es requerido";
        
        // Si se proporciona una nueva contraseña, validar que coincidan
        if (editPassword || editConfirmPassword) {
            if (editPassword !== editConfirmPassword) {
                validationErrors.confirmPassword = "Las contraseñas no coinciden";
            }
            if (editPassword.length < 6) {
                validationErrors.password = "La contraseña debe tener al menos 6 caracteres";
            }
        }
        
        if (Object.keys(validationErrors).length > 0) {
            editActions.setEditErrors(validationErrors);
            return;
        }

        // Preparar datos para actualizar
        const updateData = {
            name: editName,
            last_name: editLastName,
            email: editEmail,
            phone_number: editPhoneNumber,
            role_id: Number(editRoleId),
            ...(editPassword && { password: editPassword })
        };

        try {
            await userHandlers.updateUser(editingUser.id, updateData);

            // Limpiar formulario y cerrar modal solo si fue exitoso
            editActions.setEditingUser(null);
            editActions.setEditName("");
            editActions.setEditLastName("");
            editActions.setEditEmail("");
            editActions.setEditPhoneNumber("");
            editActions.setEditPassword("");
            editActions.setEditConfirmPassword("");
            editActions.setEditRoleId("");
            editActions.setEditErrors({});
            editActions.setIsEditSheetOpen(false);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            // No limpiar el formulario si hay error para que el usuario pueda corregir
        }
    };
};