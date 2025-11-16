import { floorSchema } from "@/lib/zod";
import Notiflix from 'notiflix';
import { FormsFloor as Floor } from "@/types/floor";

interface FloorHandlersProps {
    createFloor: (data: { floor_name: string; description: string }) => Promise<void>;
    updateFloor: (id: number, data: { floor_name: string; description: string }) => Promise<any>;
    deleteFloor: (id: number) => Promise<boolean>;
}

export const createFloorHandlers = ({
    createFloor,
    updateFloor,
    deleteFloor
}: FloorHandlersProps) => {

    const handleEdit = (
        floor: Floor,
        setEditingFloor: (floor: Floor | null) => void,
        setEditFloorName: (name: string) => void,
        setEditDescription: (desc: string) => void,
        setEditErrors: (errors: { [key: string]: string }) => void,
        setIsEditSheetOpen: (open: boolean) => void
    ) => {
        setEditingFloor(floor);
        setEditFloorName(floor.floor_name);
        setEditDescription(floor.description);
        setEditErrors({});
        setIsEditSheetOpen(true);
    };

    const handleDelete = (floor: Floor): void => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar la planta "${floor.floor_name}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await deleteFloor(floor.id);
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
        floor_name: string,
        description: string,
        setErrors: (errors: { [key: string]: string }) => void,
        setFloorName: (name: string) => void,
        setDescription: (desc: string) => void,
        closeSheet?: () => void
    ) => {
        e.preventDefault();
        setErrors({});

        const result = floorSchema.safeParse({ floor_name, description });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                floor_name: formatted.floor_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }

        try {
            await createFloor({
                floor_name,
                description,
            });

            // Limpiar formulario
            setFloorName("");
            setDescription("");
            setErrors({});

            // Cerrar Sheet si se proporcionó la función
            if (closeSheet) {
                closeSheet();
            }
        } catch (error) {
            // El error ya se maneja en createFloor
        }
    };

    const handleEditSubmit = async (
        e: React.FormEvent,
        editingFloor: Floor,
        editFloorName: string,
        editDescription: string,
        setEditErrors: (errors: { [key: string]: string }) => void,
        setEditingFloor: (floor: Floor | null) => void,
        setEditFloorName: (name: string) => void,
        setEditDescription: (desc: string) => void,
        setIsEditSheetOpen: (open: boolean) => void
    ) => {
        e.preventDefault();
        setEditErrors({});

        const result = floorSchema.safeParse({ floor_name: editFloorName, description: editDescription });

        if (!result.success) {
            const formatted = result.error.format();
            setEditErrors({
                floor_name: formatted.floor_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }

        // Verificar si se realizaron cambios
        const hasChanges = (
            editFloorName !== editingFloor.floor_name ||
            editDescription !== editingFloor.description
        );

        if (!hasChanges) {
            Notiflix.Notify.warning('Debe modificar al menos un campo para actualizar la planta', {
                timeout: 4000,
                pauseOnHover: true,
                position: 'right-top'
            });
            return;
        }

        await updateFloor(editingFloor.id, {
            floor_name: editFloorName,
            description: editDescription,
        });

        // Limpiar formulario y cerrar modal
        setEditingFloor(null);
        setEditFloorName("");
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