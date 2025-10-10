import { useState, useCallback, useMemo } from "react";
import { useUsers } from "@/hooks/useUsersAdmin";
import { useEventListener } from "@/hooks/useEventListener";
import {
    createHandleEdit,
    createHandleDelete,
    createHandleSubmit,
    createHandleEditSubmit,
    type FormActions,
    type EditFormActions,
    type UserHandlersProps
} from "@/app/(dashboard)/users/user-handlers";
import { FormState, EditFormState } from "@/types/forms-user";

export const useUserManagement = () => {
    const { users, createUser, updateUser, deleteUser, refetch } = useUsers();

    // Estados para crear usuario
    const [name, setName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    
    // Estados para editar usuario
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editConfirmPassword, setEditConfirmPassword] = useState("");
    const [editRoleId, setEditRoleId] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Preparar los objetos de estado y acciones
    const formState: FormState = useMemo(() => ({
        name, last_name, email, phone_number,
        password, confirmPassword, roleId
    }), [name, last_name, email, phone_number, password, confirmPassword, roleId]);

    const formActions: FormActions = useMemo(() => ({
        setName, setLastName, setEmail, setPhoneNumber,
        setPassword, setConfirmPassword, setRoleId, setErrors, setIsCreateSheetOpen
    }), []);

    const editFormState: EditFormState = useMemo(() => ({
        editName, editLastName, editEmail, editPhoneNumber,
        editPassword, editConfirmPassword, editRoleId
    }), [editName, editLastName, editEmail, editPhoneNumber, editPassword, editConfirmPassword, editRoleId]);

    const editFormActions: EditFormActions = useMemo(() => ({
        setEditName, setEditLastName, setEditEmail, setEditPhoneNumber,
        setEditPassword, setEditConfirmPassword, setEditRoleId, 
        setEditErrors, setEditingUser, setIsEditSheetOpen
    }), []);

    const userHandlers: UserHandlersProps = useMemo(() => ({
        createUser, updateUser, deleteUser
    }), [createUser, updateUser, deleteUser]);

    // Crear los handlers
    const handleEdit = useCallback(createHandleEdit(editFormActions), [editFormActions]);
    const handleDelete = useCallback(createHandleDelete(userHandlers), [userHandlers]);

    // Escuchar eventos de cambios en usuarios
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'users' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('users-updated', refetch);

    // Crear los handlers para los formularios
    const handleSubmit = useCallback(
        createHandleSubmit(userHandlers, formState, formActions),
        [userHandlers, formState, formActions]
    );

    const handleEditSubmit = useCallback(
        createHandleEditSubmit(userHandlers, editFormState, editFormActions, editingUser),
        [userHandlers, editFormState, editFormActions, editingUser]
    );

    // Estados del formulario de creación
    const createUserForm = {
        name, setName,
        last_name, setLastName,
        email, setEmail,
        phone_number, setPhoneNumber,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        roleId, setRoleId,
        errors,
        isCreateSheetOpen, setIsCreateSheetOpen,
        handleSubmit
    };

    // Estados del formulario de edición
    const editUserForm = {
        editingUser,
        editName, setEditName,
        editLastName, setEditLastName,
        editEmail, setEditEmail,
        editPhoneNumber, setEditPhoneNumber,
        editPassword, setEditPassword,
        editConfirmPassword, setEditConfirmPassword,
        editRoleId, setEditRoleId,
        editErrors,
        isEditSheetOpen, setIsEditSheetOpen,
        handleEditSubmit
    };

    return {
        users,
        createUserForm,
        editUserForm,
        handleEdit,
        handleDelete,
        refetch
    };
};