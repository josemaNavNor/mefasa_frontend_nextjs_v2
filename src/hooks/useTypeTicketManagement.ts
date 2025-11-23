import { useState, useCallback } from "react";
import { useTypesContext } from "@/contexts/TypesContext";
import { useEventListener } from "@/hooks/useEventListener";
import { ticketTypeSchema } from "@/lib/zod";
import { TicketType } from "@/types/ticketType";
import { TYPE_EVENTS } from "@/lib/events";
import { eventEmitter } from "./useEventListener";
import Notiflix from 'notiflix';

interface TypeTicket {
    id: number;
    type_name: string;
    description: string;
}

export const useTypeTicketManagement = () => {
    const { types, createTicketType, updateTicketType, deleteTicketType, refetch } = useTypesContext();

    // Estados para crear tipo de ticket
    const [type_name, setTicketTypeName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estado del Sheet para crear tipo - manejado internamente
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Estados para editar tipo de ticket
    const [editingType, setEditingType] = useState<TypeTicket | null>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Escuchar eventos específicos de tipos de tickets
    const handleDataChange = useCallback(() => {
        refetch();
    }, [refetch]);

    useEventListener(TYPE_EVENTS.CREATED, handleDataChange);
    useEventListener(TYPE_EVENTS.UPDATED, handleDataChange);
    useEventListener(TYPE_EVENTS.DELETED, handleDataChange);

    // Función para manejar la edición
    const handleEdit = useCallback((ticketType: TicketType) => {
        // Convertir TicketType a TypeTicket
        const typeTicket: TypeTicket = {
            id: parseInt(ticketType.id),
            type_name: ticketType.type_name,
            description: ticketType.description
        };
        
        setEditingType(typeTicket);
        setEditTypeName(ticketType.type_name);
        setEditDescription(ticketType.description);
        setEditErrors({});
        setIsEditSheetOpen(true);
    }, []);

    // Función para manejar la eliminación
    const handleDelete = useCallback((ticketType: TicketType) => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar el tipo de ticket "${ticketType.type_name}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await deleteTicketType(parseInt(ticketType.id));
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
    }, [deleteTicketType]);

    // Handler para crear tipo de ticket
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = ticketTypeSchema.safeParse({ type_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                type_name: formatted.type_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        
        try {
            await createTicketType({
                type_name,
                description,
            });
            
            // Limpiar formulario
            setTicketTypeName("");
            setDescription("");
            setErrors({});
            
            // Emitir evento para cerrar Sheet
            eventEmitter.emit(TYPE_EVENTS.CLOSE_FORM);
        } catch (error) {
            // El error ya se maneja en createTicketType
        }
    }, [createTicketType, type_name, description]);

    // Handler para editar tipo de ticket
    const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setEditErrors({});
        
        if (!editingType) return;
        
        const result = ticketTypeSchema.safeParse({ type_name: editTypeName, description: editDescription });

        if (!result.success) {
            const formatted = result.error.format();
            setEditErrors({
                type_name: formatted.type_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }

        // Verificar si se realizaron cambios
        const hasChanges = (
            editTypeName !== editingType.type_name ||
            editDescription !== editingType.description
        );
        
        if (!hasChanges) {
            Notiflix.Notify.warning('Debe modificar al menos un campo para actualizar el tipo de ticket', {
                timeout: 4000,
                pauseOnHover: true,
                position: 'right-top'
            });
            return;
        }

        await updateTicketType(editingType.id, {
            type_name: editTypeName,
            description: editDescription,
        });

        // Limpiar formulario y cerrar modal
        setEditingType(null);
        setEditTypeName("");
        setEditDescription("");
        setEditErrors({});
        setIsEditSheetOpen(false);
    }, [updateTicketType, editingType, editTypeName, editDescription]);

    // Estados del formulario de creación
    const createTypeForm = {
        type_name, setTicketTypeName,
        description, setDescription,
        errors,
        handleSubmit
    };

    // Estados del formulario de edición
    const editTypeForm = {
        editingType,
        editTypeName, setEditTypeName,
        editDescription, setEditDescription,
        editErrors,
        isEditSheetOpen, setIsEditSheetOpen,
        handleEditSubmit
    };

    return {
        types,
        createTypeForm: {
            type_name, setTicketTypeName,
            description, setDescription,
            errors,
            handleSubmit
        },
        editTypeForm: {
            editingType,
            editTypeName, setEditTypeName,
            editDescription, setEditDescription,
            editErrors,
            isEditSheetOpen, setIsEditSheetOpen,
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