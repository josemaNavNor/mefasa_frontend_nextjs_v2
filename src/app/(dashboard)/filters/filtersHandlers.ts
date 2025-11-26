import { ticketFilterSchema } from "@/lib/zod";
import { notifications } from '@/lib/notifications';
import { Filter } from '@/types/filter';

interface FilterHandlersProps {
    createFilter: (data: { filter_name: string; description: string }) => Promise<void>;
    updateFilter: (id: number, data: { filter_name?: string; description?: string }) => Promise<any>;
    deleteFilter: (id: number) => Promise<boolean>;
    toggleFavorite: (filterId: number) => Promise<'added' | 'removed' | null>;
    isFilterFavorite: (filterId: number) => boolean;
    favLoading: boolean;
}

export const createFilterHandlers = ({
    createFilter,
    updateFilter,
    deleteFilter,
    toggleFavorite,
    isFilterFavorite,
    favLoading
}: FilterHandlersProps) => {
    const handleEdit = (
        filter: Filter,
        setEditingFilter: (filter: Filter | null) => void,
        setEditFilterName: (name: string) => void,
        setEditDescription: (desc: string) => void,
        setEditErrors: (errors: { [key: string]: string }) => void,
        setIsEditSheetOpen: (open: boolean) => void
    ) => {
        setEditingFilter(filter);
        setEditFilterName(filter.filter_name);
        setEditDescription(filter.description || '');
        setEditErrors({});
        setIsEditSheetOpen(true);
    };

    const handleDelete = async (filter: Filter) => {
        notifications.confirm(
            'Confirmar eliminación',
            `¿Está seguro de que desea eliminar el filtro "${filter.filter_name}"?`,
            async () => {
                const success = await deleteFilter(filter.id);
                if (success) {
                    notifications.success('Filtro eliminado correctamente');
                } else {
                    notifications.error('Error al eliminar el filtro');
                }
            },
            () => {
                // Usuario cancelo, no hacer nada
            }
        );
    };

    const handleSubmit = async (    
        e: React.FormEvent,
        filter_name: string,
        description: string,
        setErrors: (errors: { [key: string]: string }) => void,
        setFilterName: (name: string) => void,
        setDescription: (desc: string) => void,
        closeSheet?: () => void
    ) => {
        e.preventDefault();
        setErrors({});
        
        const filterData = {
            filter_name,
            description: description || '',
            is_public: false,
            criteria: []
        };
        
        const result = ticketFilterSchema.safeParse(filterData);       
        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                filter_name: formatted.filter_name?._errors[0] || '',
                description: formatted.description?._errors[0] || '',
            });
            return;
        }
        
        try {
            await createFilter({
                filter_name,
                description,
            });
            setFilterName('');
            setDescription('');
            setErrors({});
            if (closeSheet) closeSheet();
        } catch (error) {
            // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
            if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
                return;
            }
            notifications.error('Error al crear el filtro. Por favor, inténtalo de nuevo.');
        }
    };

    const handleEditFilter = (filter: Filter, setSelectedFilter: (filter: Filter | null) => void, setIsEditDialogOpen: (open: boolean) => void) => {
        setSelectedFilter(filter);
        setIsEditDialogOpen(true);
    };

    const handleViewDetails = (filter: Filter, setSelectedFilter: (filter: Filter | null) => void, setIsDetailDialogOpen: (open: boolean) => void) => {
        setSelectedFilter(filter);
        setIsDetailDialogOpen(true);
    };

    const handleToggleFavorite = async (filter: Filter) => {
        // toggleFavorite ahora devuelve 'added' | 'removed' | null
        const result = await toggleFavorite(filter.id);
        if (result === 'added') {
            notifications.success('Filtro agregado a favoritos');
        } else if (result === 'removed') {
            notifications.success('Filtro removido de favoritos');
        } else {
            notifications.error('Error al actualizar favoritos');
        }
    };

    return {
        handleEdit,
        handleDelete,
        handleSubmit,
        handleEditFilter,
        handleViewDetails,
        handleToggleFavorite
    };

};


