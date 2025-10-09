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
        rol_name: string  
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
    technician?: {         
        id: number
        name: string
        last_name: string
    }
    type_id?: number
    due_date?: string
    created_at: string
    end_user: string
}

export type TicketPage = {
    id: string,
    ticket_number: string
    summary: string
    end_user: string
    technician: { name: string, last_name: string } | null,
    type: { type_name: string } | null,
    priority: string,
    status: string,
    due_date: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
}

