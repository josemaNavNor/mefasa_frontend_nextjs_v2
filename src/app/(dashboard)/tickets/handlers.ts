import { notifications } from '@/lib/notifications';
import { api } from '@/lib/httpClient';
import { eventEmitter } from '@/hooks/useEventListener';
import { TICKET_EVENTS, GLOBAL_EVENTS } from '@/lib/events';
import { createTicketSchema } from '@/lib/zod';
import type { Ticket, CreateTicketDto } from '@/types';
import { logger } from '@/lib/logger';
import { getCurrentUserEmail } from '@/lib/ticket-utils';

interface TicketHandlersProps {
    createTicket: (data: CreateTicketDto) => Promise<void>;
    deleteTicket: (id: string | number) => Promise<boolean>;
    exportToExcel: (ticketsToExport?: Ticket[]) => void;
    refetch: () => Promise<void>;
}

/**
 * Convierte un archivo a base64
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Sube un archivo al servidor
 */
const uploadFile = async (file: File, ticketId: number): Promise<void> => {
    try {
        const base64Data = await fileToBase64(file);
        
        await api.post('/files', {
            filename: file.name,
            file_type: file.type,
            ticket_id: ticketId,
            file_data: base64Data,
        });
    } catch (error) {
        throw new Error(
            error instanceof Error 
                ? `Error al subir "${file.name}": ${error.message}`
                : `Error al subir "${file.name}"`
        );
    }
};

/**
 * Sube múltiples archivos para un ticket
 */
const uploadFiles = async (files: File[], ticketId: number): Promise<void> => {
    if (files.length === 0) return;

    const uploadPromises = files.map((file) => uploadFile(file, ticketId));
    const results = await Promise.allSettled(uploadPromises);

    const errors: string[] = [];
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            errors.push(result.reason?.message || `Error al subir ${files[index].name}`);
        }
    });

    if (errors.length > 0) {
        if (errors.length === files.length) {
            // Todos los archivos fallaron
            throw new Error(`Error al subir archivos: ${errors.join(', ')}`);
        } else {
            // Algunos archivos fallaron
            notifications.warning(
                `Se subieron ${files.length - errors.length} de ${files.length} archivos. Errores: ${errors.join(', ')}`
            );
        }
    }
};

export const createTicketHandlers = ({
    createTicket,
    deleteTicket,
    exportToExcel,
    refetch
}: TicketHandlersProps) => {
    
    const handleDelete = (ticket: Ticket): void => {
        notifications.confirm(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar el ticket "${ticket.ticket_number} - ${ticket.summary}"?`,
            async () => {
                await deleteTicket(ticket.id);
            },
            () => {
                // Cancelado, no hacer nada
            }
        );
    };

    const handleSubmit = async (
        e: React.FormEvent,
        formData: {
            ticket_number: string;
            summary: string;
            description: string;
            end_user: string;
            technician_id: string;
            type_id: string;
            floor_id: string;
            priority: string;
            status: string;
            due_date: string;
        },
        setters: {
            setSummary: (value: string) => void;
            setDescription: (value: string) => void;
            setEndUser: (value: string) => void;
            setTechnicianId: (value: string) => void;
            setTypeId: (value: string) => void;
            setFloorId: (value: string) => void;
            setPriority: (value: string) => void;
            setStatus: (value: string) => void;
            setDueDate: (value: string) => void;
            setErrors: (errors: { [key: string]: string }) => void;
        },
        files: File[],
        setFiles: (files: File[]) => void,
        onSuccess?: () => void
    ) => {
        e.preventDefault();
        setters.setErrors({});

        try {
            // Obtener email del usuario del localStorage ANTES de validar
            const endUserEmail = getCurrentUserEmail();
            if (!endUserEmail) {
                notifications.error('No se pudo obtener el email del usuario autenticado. Por favor, inicia sesión nuevamente.');
                return;
            }

            // Preparar datos del ticket con el email del usuario
            const ticketData: CreateTicketDto = {
                ticket_number: formData.ticket_number,
                summary: formData.summary,
                description: formData.description,
                end_user: endUserEmail, // Usar siempre el email del localStorage
                technician_id: formData.technician_id && formData.technician_id !== "0" ? Number(formData.technician_id) : null,
                type_id: Number(formData.type_id),
                floor_id: formData.floor_id && formData.floor_id !== "0" ? Number(formData.floor_id) : null,
                priority: formData.priority,
                status: formData.status,
                due_date: formData.due_date
            };

            // Validar datos con Zod
            const validation = createTicketSchema.safeParse(ticketData);
            if (!validation.success) {
                const firstError = validation.error.issues[0];
                notifications.error(firstError?.message || 'Error de validación');
                setters.setErrors({
                    [firstError.path[0] as string]: firstError.message
                });
                return;
            }

            // Crear el ticket directamente para obtener la respuesta con el ID
            const response = await api.post('/tickets', validation.data);
            const createdTicket = response as Ticket;

            // Subir archivos si el ticket se creó correctamente
            if (createdTicket && files.length > 0) {
                try {
                    await uploadFiles(files, createdTicket.id);
                    if (files.length > 0) {
                        notifications.success(`${files.length} archivo(s) subido(s) correctamente`);
                    }
                } catch (uploadError) {
                    // El ticket ya se creó, pero hubo error al subir archivos
                    notifications.warning(
                        uploadError instanceof Error 
                            ? uploadError.message 
                            : 'El ticket se creó pero hubo problemas al subir algunos archivos'
                    );
                }
            }

            // Refrescar la lista de tickets
            await refetch();
            
            // Emitir eventos específicos para la página de tickets
            eventEmitter.emit(TICKET_EVENTS.CREATED, response);
            eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'tickets');
            eventEmitter.emit(GLOBAL_EVENTS.TICKETS_UPDATED);
            
            notifications.success('Ticket creado correctamente');

            // Reset form
            setters.setSummary("");
            setters.setDescription("");
            // Resetear end_user al email del usuario actual
            const currentUserEmail = getCurrentUserEmail();
            setters.setEndUser(currentUserEmail || "");
            setters.setTechnicianId("0");
            setters.setTypeId("");
            setters.setFloorId("0");
            setters.setPriority("");
            setters.setStatus("");
            setters.setDueDate("");
            setFiles([]);

            // Call success callback to close the sheet
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // Error ya manejado en createTicket
            // Logging silencioso ya que el error se maneja en createTicket
        }
    };

    const handleRowClick = (
        ticket: Ticket,
        setSelectedTicket: (ticket: Ticket) => void,
        setShowDetailsModal: (show: boolean) => void
    ) => {
        setSelectedTicket(ticket);
        setShowDetailsModal(true);
    };

    const handleEditTicket = (
        ticket: Ticket,
        setEditingTicket: (ticket: Ticket) => void,
        setShowEditDialog: (show: boolean) => void
    ) => {
        setEditingTicket(ticket);
        setShowEditDialog(true);
    };

    const handleExportToExcel = () => {
        exportToExcel();
    };

    const handleDataChange = (
        dataType: string,
        refetch: () => void
    ) => {
        if (dataType === 'roles' || dataType === 'all') {
            refetch();
        }
    };

    return {
        handleDelete,
        handleSubmit,
        handleRowClick,
        handleEditTicket,
        handleExportToExcel,
        handleDataChange
    };
};