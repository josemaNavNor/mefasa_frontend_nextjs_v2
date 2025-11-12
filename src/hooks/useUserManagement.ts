import { useState, useCallback, useMemo } from "react";
import { useUsers } from "@/hooks/useUsersAdmin";
import { useEventListener } from "@/hooks/useEventListener";
import { USER_EVENTS } from "@/lib/events";
import { eventEmitter } from "./useEventListener";
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
    
    // Estado del Sheet para crear usuario - manejado internamente
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
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

    // Esto crea un objeto con los estados del formulario de creacion
    const formState: FormState = useMemo(() => ({
        name, last_name, email, phone_number,
        password, confirmPassword, roleId
    }), [name, last_name, email, phone_number, password, confirmPassword, roleId]);


    // Esto crea un objeto con las acciones del formulario de creación
    const formActions: FormActions = useMemo(() => ({
        setName, setLastName, setEmail, setPhoneNumber,
        setPassword, setConfirmPassword, setRoleId, setErrors, 
        setIsCreateSheetOpen: () => {
            // Emitir evento para cerrar Sheet
            eventEmitter.emit(USER_EVENTS.CLOSE_FORM);
        }
    }), []);

    // Esto crea un objeto con los estados del formulario de edición
    const editFormState: EditFormState = useMemo(() => ({
        editName, editLastName, editEmail, editPhoneNumber,
        editPassword, editConfirmPassword, editRoleId
    }), [editName, editLastName, editEmail, editPhoneNumber, editPassword, editConfirmPassword, editRoleId]);


    // Esto crea un objeto con las acciones del formulario de edición
    const editFormActions: EditFormActions = useMemo(() => ({
        setEditName, setEditLastName, setEditEmail, setEditPhoneNumber,
        setEditPassword, setEditConfirmPassword, setEditRoleId, 
        setEditErrors, setEditingUser, setIsEditSheetOpen
    }), []);

    // Esto crea un objeto con los handlers de usuario
    const userHandlers: UserHandlersProps = useMemo(() => ({
        createUser, updateUser, deleteUser
    }), [createUser, updateUser, deleteUser]);

    // Esto crea los handlers para editar y eliminar usuarios
    const handleEdit = useCallback(createHandleEdit(editFormActions), [editFormActions]);
    const handleDelete = useCallback(createHandleDelete(userHandlers), [userHandlers]);

    // Esto hace que al recibir los eventos específicos de usuarios se refresquen
    const handleDataChange = useCallback(() => {
        refetch();
    }, [refetch]);

    // Escuchar eventos específicos de usuarios
    useEventListener(USER_EVENTS.REFRESH_USERS_PAGE, handleDataChange);
    useEventListener(USER_EVENTS.UPDATED, handleDataChange);
    useEventListener(USER_EVENTS.DELETED, handleDataChange);
    useEventListener(USER_EVENTS.CREATED, handleDataChange);

    // Crear los handlers para los formularios
    const handleSubmit = useCallback(
        createHandleSubmit(userHandlers, formState, formActions),
        [userHandlers, formState, formActions]
    );

    // Crear el handler para el formulario de edicion
    const handleEditSubmit = useCallback(
        createHandleEditSubmit(userHandlers, editFormState, editFormActions, editingUser),
        [userHandlers, editFormState, editFormActions, editingUser]
    );

    // Estados del formulario de creacion
    const createUserForm = {
        name, setName,
        last_name, setLastName,
        email, setEmail,
        phone_number, setPhoneNumber,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        roleId, setRoleId,
        errors,
        handleSubmit
    };

    // Estados del formulario de edicion
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
        // Estado interno del Sheet para la página
        isSheetOpen,
        setIsSheetOpen,
        handleEdit,
        handleDelete,
        refetch
    };
};