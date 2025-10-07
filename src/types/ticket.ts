// Tipos compartidos para los componentes de tickets

export interface TicketComment {
    id: string | number
    body: string
    is_public: boolean
    created_at: string
    users?: {
        id: number
        name: string
        last_name: string
        email: string
    }
    comments_files?: any[]
}

export interface TicketHistoryItem {
    id: string | number
    action_type: string
    description: string
    created_at: string
    user?: {
        name: string
        last_name: string
    }
}

export interface User {
    id: number
    name: string
    last_name: string
    email: string
    role?: {
        rol_name: string  // El backend devuelve 'rol_name' no 'role_name'
    }
}

export interface TicketType {
    id: number
    type_name: string
}

export interface Ticket {
    id: string | number
    ticket_number: string
    summary: string
    description?: string
    status: string
    priority: string
    technician_id?: number  // Para actualizaciones
    technician?: {         // Como viene del backend
        id: number
        name: string
        last_name: string
    }
    type_id?: number
    due_date?: string
    created_at: string
    end_user: string
}