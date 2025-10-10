import { useState, useCallback } from "react";
import { useType } from "@/hooks/use_typeTickets";
import { useEventListener } from "@/hooks/useEventListener";
import { ticketTypeSchema } from "@/lib/zod";
import { TicketType } from "@/types/ticketType";
import Notiflix from 'notiflix';

interface TypeTicket {
    id: number;
    type_name: string;
    description: string;
}

export const useTypeTicketManagement = () => {
    const { types, createTicketType, updateTicketType, deleteTicketType, refetch } = useType();

    // Estados para crear tipo de ticket
    const [type_name, setTicketTypeName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estados para editar tipo de ticket
    const [editingType, setEditingType] = useState<TypeTicket | null>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Escuchar eventos de cambios en tipos de tickets
    const handleDataChange = useCallback((dataType: string) => {
        if (dataType === 'types' || dataType === 'all') {
            refetch();
        }
    }, [refetch]);

    useEventListener('data-changed', handleDataChange);
    useEventListener('types-updated', refetch);

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
        
        await createTicketType({
            type_name,
            description,
        });
        
        // Limpiar formulario solo si fue exitoso
        setTicketTypeName("");
        setDescription("");
        setErrors({});
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
        createTypeForm,
        editTypeForm,
        handleEdit,
        handleDelete,
        refetch
    };
};