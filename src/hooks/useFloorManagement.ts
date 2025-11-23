import { useState, useCallback, useMemo } from "react";
import { useFloorsContext } from "@/contexts/FloorsContext";
import { useEventListener } from "@/hooks/useEventListener";
import { createFloorHandlers } from "@/app/(dashboard)/floors/floorHandlers";
import { Floor, FormsFloor } from "@/types/floor";
import { FLOOR_EVENTS } from "@/lib/events";
import { eventEmitter } from "./useEventListener";

export const useFloorManagement = () => {
    const { floors, createFloor, updateFloor, deleteFloor, refetch } = useFloorsContext();

    // Estados para crear planta
    const [floor_name, setFloorName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Estado del Sheet para crear planta - manejado internamente
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Estados para editar planta
    const [editingFloor, setEditingFloor] = useState<FormsFloor | null>(null);
    const [editFloorName, setEditFloorName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Crear handlers
    const handlers = useMemo(() => createFloorHandlers({
        createFloor,
        updateFloor,
        deleteFloor
    }), [createFloor, updateFloor, deleteFloor]);

    // Escuchar eventos específicos de plantas
    const handleDataChange = useCallback(() => {
        refetch();
    }, [refetch]);

    useEventListener(FLOOR_EVENTS.CREATED, handleDataChange);
    useEventListener(FLOOR_EVENTS.UPDATED, handleDataChange);
    useEventListener(FLOOR_EVENTS.DELETED, handleDataChange);

    // Wrapper functions para los handlers con los estados
    const handleEdit = useCallback((floor: Floor) => {
        // Convertir Floor a FormsFloor para los handlers
        const formsFloor: FormsFloor = {
            id: parseInt(floor.id),
            floor_name: floor.floor_name,
            description: floor.description
        };
        
        handlers.handleEdit(
            formsFloor,
            setEditingFloor,
            setEditFloorName,
            setEditDescription,
            setEditErrors,
            setIsEditSheetOpen
        );
    }, [handlers]);

    const handleDelete = useCallback((floor: Floor) => {
        // Convertir Floor a FormsFloor para los handlers
        const formsFloor: FormsFloor = {
            id: parseInt(floor.id),
            floor_name: floor.floor_name,
            description: floor.description
        };
        
        handlers.handleDelete(formsFloor);
    }, [handlers]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        await handlers.handleSubmit(
            e,
            floor_name,
            description,
            setErrors,
            setFloorName,
            setDescription,
            () => {
                // Emitir evento para cerrar Sheet
                eventEmitter.emit(FLOOR_EVENTS.CLOSE_FORM);
            }
        );
    }, [handlers, floor_name, description]);

    const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
        if (!editingFloor) return;
        
        await handlers.handleEditSubmit(
            e,
            editingFloor,
            editFloorName,
            editDescription,
            setEditErrors,
            setEditingFloor,
            setEditFloorName,
            setEditDescription,
            setIsEditSheetOpen
        );
    }, [handlers, editingFloor, editFloorName, editDescription]);

    // Estados del formulario de creación
    const createFloorForm = {
        floor_name,
        setFloorName,
        description,
        setDescription,
        errors,
        handleSubmit
    };

    // Estados del formulario de edición
    const editFloorForm = {
        editingFloor,
        editFloorName,
        setEditFloorName,
        editDescription,
        setEditDescription,
        editErrors,
        isEditSheetOpen,
        setIsEditSheetOpen,
        handleEditSubmit
    };

    return {
        floors,
        createFloorForm: {
            floor_name,
            setFloorName,
            description,
            setDescription,
            errors,
            handleSubmit
        },
        editFloorForm: {
            editingFloor,
            editFloorName,
            setEditFloorName,
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