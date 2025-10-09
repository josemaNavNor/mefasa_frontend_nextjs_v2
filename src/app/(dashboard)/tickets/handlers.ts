import Notiflix from 'notiflix';

interface Ticket {
    id: string;
    ticket_number: string;
    summary: string;
    description: string;
    end_user: string;
    technician_id: number;
    type_id: number;
    priority: string;
    status: string;
    floor_id: number;
    area_id: number;
    due_date: string;
}

interface TicketHandlersProps {
    createTicket: (data: {
        ticket_number: string;
        summary: string;
        description: string;
        end_user: string;
        technician_id: number;
        type_id: number;
        priority: string;
        status: string;
        floor_id: number;
        area_id: number;
        due_date: string;
    }) => Promise<void>;
    deleteTicket: (id: string) => Promise<boolean>;
    exportToExcel: (ticketsToExport?: any[]) => void;
}

export const createTicketHandlers = ({
    createTicket,
    deleteTicket,
    exportToExcel
}: TicketHandlersProps) => {
    
    const handleDelete = (ticket: any): void => {
        Notiflix.Confirm.show(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar el ticket "${ticket.ticket_number} - ${ticket.summary}"?`,
            'Eliminar',
            'Cancelar',
            async () => {
                await deleteTicket(ticket.id);
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
        formData: {
            ticket_number: string;
            summary: string;
            description: string;
            end_user: string;
            technician_id: string;
            type_id: string;
            floor_id: string;
            area_id: string;
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
            setAreaId: (value: string) => void;
            setPriority: (value: string) => void;
            setStatus: (value: string) => void;
            setDueDate: (value: string) => void;
            setErrors: (errors: { [key: string]: string }) => void;
        }
    ) => {
        e.preventDefault();
        setters.setErrors({});

        await createTicket({
            ticket_number: formData.ticket_number,
            summary: formData.summary,
            description: formData.description,
            end_user: formData.end_user,
            technician_id: Number(formData.technician_id),
            type_id: Number(formData.type_id),
            floor_id: Number(formData.floor_id),
            area_id: Number(formData.area_id),
            priority: formData.priority,
            status: formData.status,
            due_date: formData.due_date
        });

        // Reset form
        setters.setSummary("");
        setters.setDescription("");
        setters.setEndUser("");
        setters.setTechnicianId("");
        setters.setTypeId("");
        setters.setFloorId("");
        setters.setAreaId("");
        setters.setPriority("");
        setters.setStatus("");
        setters.setDueDate("");
    };

    const handleRowClick = (
        ticket: any,
        setSelectedTicket: (ticket: any) => void,
        setShowDetailsModal: (show: boolean) => void
    ) => {
        setSelectedTicket(ticket);
        setShowDetailsModal(true);
    };

    const handleEditTicket = (
        ticket: any,
        setEditingTicket: (ticket: any) => void,
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