// Tipos compartidos para los componentes de tickets

export interface TicketComment {
    id: string | number
    body: string
    is_public: boolean
    created_at: string
    users?: {
        name: string
        last_name: string
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
        role_name: string
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
    technician_id?: number
    type_id?: number
    due_date?: string
    created_at: string
    end_user?: {
        name: string
        last_name: string
        email: string
    }
}